def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AI Requirement-to-Code" in data["service"]


def test_user_registration_and_login_flow(client):
    # 1. Register User
    reg_payload = {
        "full_name": "Elena Rostova",
        "email": "elena@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data

    # 2. Prevent duplicate registration
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct credentials
    login_payload = {
        "email": "elena@example.com",
        "password": "Password123!",
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Check /api/auth/me
    headers = {"Authorization": f"Bearer {login_data['access_token']}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "elena@example.com"
    assert user_data["full_name"] == "Elena Rostova"
    assert user_data["is_active"] is True


def test_invalid_login(client):
    bad_login = {
        "email": "unknown@example.com",
        "password": "wrongpassword",
    }
    res = client.post("/api/auth/login", json=bad_login)
    assert res.status_code == 401
