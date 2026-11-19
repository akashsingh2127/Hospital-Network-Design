from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.services.sync_service import manager
from backend.app.integrations.packet_tracer import PacketTracerIntegration

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial handshake message with current state
    try:
        fp = PacketTracerIntegration.get_state_fingerprint()
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "timestamp": datetime.utcnow().isoformat(),
            "pt_running": fp.get("pt_running", False),
            "freshness": "CURRENT" if fp.get("pt_running") else "STALE"
        })
        while True:
            # Keep connection open and receive client heartbeats/pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
