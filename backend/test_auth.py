#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_bcrypt():
    """Test bcrypt functionality"""
    try:
        import bcrypt
        print("✅ bcrypt imported successfully")
        
        # Test password hashing
        password = "test123"
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        print(f"✅ Password hashed: {hashed[:20]}...")
        
        # Test password verification
        is_valid = bcrypt.checkpw(password_bytes, hashed)
        print(f"✅ Password verification: {is_valid}")
        
        return True
    except Exception as e:
        print(f"❌ bcrypt error: {e}")
        return False

def test_pyjwt():
    """Test PyJWT functionality"""
    try:
        import jwt
        print("✅ PyJWT imported successfully")
        
        # Test basic JWT
        payload = {"test": "data"}
        secret = "test-secret"
        token = jwt.encode(payload, secret, algorithm="HS256")
        print(f"✅ JWT token created: {token[:20]}...")
        
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        print(f"✅ JWT decoded: {decoded}")
        
        return True
    except Exception as e:
        print(f"❌ PyJWT error: {e}")
        return False

def test_security_module():
    """Test our security module"""
    try:
        from src.core.security import hash_password, verify_password
        print("✅ Security module imported successfully")
        
        # Test password functions
        password = "test123"
        hashed = hash_password(password)
        print(f"✅ Password hashed via security module: {hashed[:20]}...")
        
        is_valid = verify_password(password, hashed)
        print(f"✅ Password verification via security module: {is_valid}")
        
        return True
    except Exception as e:
        print(f"❌ Security module error: {e}")
        return False

def test_keys():
    """Test RSA keys"""
    try:
        from src.core.security import load_private_key, load_public_key
        
        private_key = load_private_key()
        print(f"✅ Private key loaded: {len(private_key)} bytes")
        
        public_key = load_public_key()
        print(f"✅ Public key loaded: {len(public_key)} bytes")
        
        return True
    except Exception as e:
        print(f"❌ Keys error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing authentication components...\n")
    
    tests = [
        ("bcrypt", test_bcrypt),
        ("PyJWT", test_pyjwt),
        ("Security Module", test_security_module),
        ("RSA Keys", test_keys),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n📝 Testing {name}:")
        result = test_func()
        results.append((name, result))
    
    print("\n" + "="*50)
    print("📊 Test Results:")
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    print(f"\nOverall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}") 