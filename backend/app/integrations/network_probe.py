import socket
import time
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional, Tuple
from backend.app.schemas.network import (
    DataSource,
    StatusLevel,
    NetworkServiceSchema,
    NetworkHealthSchema,
    MetricPoint
)

class NetworkProbe:
    """
    Performs real backend host network probes.
    Tests network sockets concurrently, measures latency if reachable,
    and accurately documents unreachable simulated endpoints.
    """

    @staticmethod
    def probe_socket(ip: str, port: int, timeout: float = 0.15) -> Tuple[bool, Optional[float], str]:
        start = time.perf_counter()
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        try:
            res = s.connect_ex((ip, port))
            latency = (time.perf_counter() - start) * 1000.0
            if res == 0:
                return True, round(latency, 2), "Connection successful"
            else:
                return False, None, f"Port {port} closed or unreachable (code: {res})"
        except socket.timeout:
            return False, None, f"Probe timed out after {timeout}s"
        except Exception as e:
            return False, None, f"Probe error: {str(e)}"
        finally:
            s.close()

    @classmethod
    def _probe_single_service(cls, s: Dict[str, Any]) -> NetworkServiceSchema:
        reachable, latency, detail = cls.probe_socket(s["ip"], s["port"], timeout=0.15)
        if reachable:
            status = StatusLevel.ONLINE
            src = DataSource.BACKEND_PROBE
            verification_note = f"Verified by host probe ({latency} ms)"
        else:
            status = StatusLevel.UNKNOWN
            src = DataSource.BACKEND_PROBE
            verification_note = (
                f"Simulated canvas IP {s['ip']}:{s['port']} not routable from host Windows OS. "
                "Packet Tracer simulation runs in isolated network namespace."
            )

        return NetworkServiceSchema(
            id=s["id"],
            name=s["name"],
            protocol=s["protocol"],
            port=s["port"],
            ip_address=s["ip"],
            fqdn=s["fqdn"],
            status=status,
            source=src,
            verification_detail=verification_note
        )

    @classmethod
    def check_hq_services(cls) -> List[NetworkServiceSchema]:
        """
        Check the availability of documented HQ DMZ services concurrently:
        - DNS (10.0.1.162:53)
        - HTTP (10.0.1.163:80)
        - FTP (10.0.1.164:21)
        - Email (10.0.1.165:25)
        """
        services_config = [
            {"id": "srv_dns", "name": "Hospital DNS", "protocol": "DNS (UDP/TCP)", "port": 53, "ip": "10.0.1.162", "fqdn": "dns.hospital.com"},
            {"id": "srv_http", "name": "Internal Web Portal", "protocol": "HTTP", "port": 80, "ip": "10.0.1.163", "fqdn": "portal.hospital.com"},
            {"id": "srv_ftp", "name": "Medical Reports FTP", "protocol": "FTP", "port": 21, "ip": "10.0.1.164", "fqdn": "ftp.hospital.com"},
            {"id": "srv_email", "name": "Hospital Mail Server", "protocol": "SMTP", "port": 25, "ip": "10.0.1.165", "fqdn": "mail.hospital.com"},
        ]

        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(cls._probe_single_service, services_config))

        return results
