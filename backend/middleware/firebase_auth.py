import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

# Initialize Firebase Admin SDK
_firebase_app = None


def init_firebase():
    """Initialize Firebase Admin SDK"""
    global _firebase_app
    if _firebase_app:
        return

    cred = None

    # 1. Try env var (production — Render, Railway, etc.)
    cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    if cred_json:
        try:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            print("✅ Firebase Admin SDK initialized from env var")
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️  FIREBASE_CREDENTIALS_JSON parse error: {e}")

    # 2. Fall back to local file (dev)
    if not cred:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            print("✅ Firebase Admin SDK initialized from credentials file")

    # 3. Initialize app
    if cred:
        _firebase_app = firebase_admin.initialize_app(cred)
    else:
        try:
            _firebase_app = firebase_admin.initialize_app()
            print("✅ Firebase Admin SDK initialized with default credentials")
        except Exception:
            print("⚠️  Firebase credentials not found. Auth verification disabled (dev mode).")
            print("   Set FIREBASE_CREDENTIALS_JSON env var or provide credentials file.")


# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verify Firebase ID token and return user info.
    Used as a dependency in protected routes.
    """
    token = credentials.credentials

    # Dev mode: if no Firebase app, accept any token and extract as mock user
    if not _firebase_app:
        # In dev mode without Firebase credentials, create a mock user
        return {
            "uid": "dev-user-001",
            "email": "dev@notegenius.app",
            "name": "Dev User",
        }

    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token, clock_skew_seconds=60)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email", ""),
            "name": decoded_token.get("name", ""),
        }
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token หมดอายุ กรุณา login ใหม่",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ไม่ถูกต้อง",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"การยืนยันตัวตนล้มเหลว: {str(e)}",
        )
