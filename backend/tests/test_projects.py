def test_complete_project_lifecycle(client):
    # 1. Register User & get token
    reg_payload = {
        "full_name": "Dev User",
        "email": "dev@example.com",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Project
    proj_payload = {
        "name": "FinPulse AI",
        "business_idea": "AI-powered automated financial forecasting and cash flow anomaly detection platform",
        "target_users": "CFOs, Small Business Owners, Financial Analysts",
        "main_problem": "Manual spreadsheet reconciliation is error prone and slow",
        "expected_features": "CSV transaction import, Automated invoice categorization, LLM cash-flow prediction, Exportable PDF reports",
        "preferred_tech_stack": "React + TypeScript + FastAPI + PostgreSQL",
        "constraints": "Strict data privacy, sub-second query response",
    }
    create_res = client.post("/api/projects", json=proj_payload, headers=headers)
    assert create_res.status_code == 201
    project = create_res.json()
    proj_id = project["id"]
    assert project["name"] == "FinPulse AI"
    assert project["current_stage"] == "requirements"

    # 3. Generate Requirements
    req_res = client.post(f"/api/projects/{proj_id}/requirements/generate", headers=headers)
    assert req_res.status_code == 200
    req_data = req_res.json()
    assert len(req_data["functional_requirements"]) >= 4
    assert len(req_data["user_stories"]) >= 2

    # 4. Generate SRS
    srs_res = client.post(f"/api/projects/{proj_id}/srs/generate", headers=headers)
    assert srs_res.status_code == 200
    srs_data = srs_res.json()
    assert "Software Requirements Specification" in srs_data["full_markdown"]
    assert srs_data["version"] == "1.0.0"

    # 5. Generate Architecture
    arch_res = client.post(f"/api/projects/{proj_id}/architecture/generate", headers=headers)
    assert arch_res.status_code == 200
    arch_data = arch_res.json()
    assert len(arch_data["components"]) >= 4
    assert len(arch_data["nodes"]) >= 4
    assert len(arch_data["spatial_3d_nodes"]) >= 4

    # 6. Generate DB & API Design
    db_res = client.post(f"/api/projects/{proj_id}/database/generate", headers=headers)
    assert db_res.status_code == 200
    db_data = db_res.json()
    assert len(db_data["entities"]) >= 2
    assert "CREATE TABLE" in db_data["sql_schema_ddl"]

    # Verify API endpoints were generated
    api_res = client.get(f"/api/projects/{proj_id}/api-design", headers=headers)
    assert api_res.status_code == 200
    endpoints = api_res.json()
    assert len(endpoints) >= 3

    # 7. Generate Code
    code_res = client.post(f"/api/projects/{proj_id}/code-generation/generate", json={"force_regenerate": True}, headers=headers)
    assert code_res.status_code == 200
    files = code_res.json()
    assert len(files) >= 10
    file_paths = [f["path"] for f in files]
    assert "backend/app/main.py" in file_paths
    assert "frontend/src/App.tsx" in file_paths
    assert "docker-compose.yml" in file_paths

    # 8. Workspace File Edit
    main_file = next(f for f in files if f["path"] == "backend/app/main.py")
    edit_res = client.put(
        f"/api/projects/{proj_id}/workspace/files/{main_file['id']}",
        json={"content": "# Custom Modified Content\n" + main_file["content"]},
        headers=headers
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["is_user_edited"] is True

    # 9. Run Code Review & Tests
    review_res = client.post(f"/api/projects/{proj_id}/reviews/run", headers=headers)
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert review_data["total_issues"] > 0

    test_res = client.post(f"/api/projects/{proj_id}/reviews/tests/run", headers=headers)
    assert test_res.status_code == 200
    assert test_res.json()["passed_count"] >= 4

    # 10. Generate Documentation
    doc_res = client.post(f"/api/projects/{proj_id}/docs/generate", headers=headers)
    assert doc_res.status_code == 200
    docs = doc_res.json()
    assert len(docs) >= 5

    # 11. Export ZIP
    zip_res = client.get(f"/api/projects/{proj_id}/export/zip", headers=headers)
    assert zip_res.status_code == 200
    assert zip_res.headers["content-type"] == "application/zip"
    assert len(zip_res.content) > 1000

    # 12. Check Dashboard Stats
    stats_res = client.get("/api/projects/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_projects"] >= 1
    assert stats["total_generated_files"] >= 10
