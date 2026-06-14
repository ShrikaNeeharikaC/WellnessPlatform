import pytest


REGISTER_PAYLOAD = {
    "first_name":       "Jane",
    "last_name":        "Doe",
    "username":         "janedoe",
    "email":            "jane@example.com",
    "password":         "Password1",
    "confirm_password": "Password1",
}


class TestRegister:
    def test_register_success(self, client):
        r = client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
        assert r.status_code == 201
        body = r.json()
        assert "access_token"  in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"

    def test_register_duplicate_username(self, client):
        client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
        r = client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
        assert r.status_code == 409
        assert "Username" in r.json()["detail"]

    def test_register_weak_password(self, client):
        payload = {**REGISTER_PAYLOAD, "username": "newuser2", "email": "new2@example.com",
                   "password": "abc", "confirm_password": "abc"}
        r = client.post("/api/v1/auth/register", json=payload)
        assert r.status_code == 422

    def test_register_password_mismatch(self, client):
        payload = {**REGISTER_PAYLOAD, "username": "newuser3", "email": "new3@example.com",
                   "confirm_password": "Different1"}
        r = client.post("/api/v1/auth/register", json=payload)
        assert r.status_code == 422

    def test_register_invalid_email(self, client):
        payload = {**REGISTER_PAYLOAD, "username": "newuser4", "email": "not-an-email"}
        r = client.post("/api/v1/auth/register", json=payload)
        assert r.status_code == 422


class TestLogin:
    def test_login_success(self, client, registered_user):
        r = client.post("/api/v1/auth/login", json={"username": "testuser", "password": "Password1"})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, client, registered_user):
        r = client.post("/api/v1/auth/login", json={"username": "testuser", "password": "WrongPass1"})
        assert r.status_code == 401

    def test_login_unknown_user(self, client):
        r = client.post("/api/v1/auth/login", json={"username": "nobody", "password": "Password1"})
        assert r.status_code == 401


class TestMeEndpoint:
    def test_get_me(self, client, auth_headers):
        r = client.get("/api/v1/auth/me", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["username"] == "testuser"
        assert body["role"]     == "member"

    def test_get_me_no_token(self, client):
        r = client.get("/api/v1/auth/me")
        assert r.status_code == 403


class TestRefreshAndLogout:
    def test_refresh_token(self, client, registered_user):
        r = client.post("/api/v1/auth/refresh",
                        json={"refresh_token": registered_user["refresh_token"]})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_logout(self, client, registered_user):
        r = client.post("/api/v1/auth/logout",
                        json={"refresh_token": registered_user["refresh_token"]})
        assert r.status_code == 204
