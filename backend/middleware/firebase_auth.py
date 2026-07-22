import os
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

    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized with credentials file")
    else:
        # Try default credentials (for Cloud environments)
        try:
            _firebase_app = firebase_admin.initialize_app()
            print("✅ Firebase Admin SDK initialized with default credentials")
        except Exception:
            print("⚠️  Firebase credentials not found. Auth verification disabled (dev mode).")
            print(f"   Expected file: {cred_path}")
            print("   Download from Firebase Console → Project Settings → Service Accounts")


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
