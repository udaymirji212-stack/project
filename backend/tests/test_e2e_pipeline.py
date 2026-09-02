import io
import zipfile

def test_full_9_stage_pipeline(client):
    """
    Complete end-to-end test simulating the exact user journey across all 9 stages:
    1. Register & Login
    2. Create Project
    3. Generate Requirements (Stage 1)
    4. Generate SRS Document (Stage 2)
    5. Generate Architecture (Stage 3)
    6. Generate Database & REST API (Stage 4)
    7. Generate Codebase (Stage 5)
    8. Monaco Workspace File Operations (Stage 6)
    9. Run Code Review & Pytests (Stage 7)
    10. Generate Documentation (Stage 8)
    11. Export Sanitized ZIP Archive (Stage 9)
    """
    # 1. Registration
    reg_payload = {
        "full_name": "Pipeline Architect",
        "email": "pipeline_master@req2code.io",
        "password": "MasterSecurePassword123!",
        "confirm_password": "MasterSecurePassword123!",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, reg_res.text
    tokens = reg_res.json()
    access_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Create Project
    project_payload = {
        "name": "Global FinTech Ledger Platform",
        "business_idea": "Build a multi-currency real-time cross-border payment routing engine with double-entry accounting, ISO 20022 compliance, and audit logging.",
        "target_users": "Financial institutions, fintechs, and payment service providers",
        "main_problem": "Legacy banking gateways lack real-time double-entry ledger audits",
        "expected_features": "Real-time double-entry ledger, ISO 20022 message parser, Multi-currency conversion, Idempotency keys, Audit trail",
        "preferred_tech_stack": "FastAPI + React + PostgreSQL",
        "industry_domain": "FinTech",
        "constraints": "Sub-second settlement, FIPS-compliant encryption"
    }
    proj_res = client.post("/api/projects", json=project_payload, headers=headers)
    assert proj_res.status_code == 201, proj_res.text
    project = proj_res.json()
    project_id = project["id"]
    assert project["name"] == "Global FinTech Ledger Platform"
    assert project["current_stage"] == "requirements"

    # 3. Stage 1: Requirements Generation
    req_res = client.post(f"/api/projects/{project_id}/requirements/generate", headers=headers)
    assert req_res.status_code == 200, req_res.text
    req_data = req_res.json()
    assert len(req_data["functional_requirements"]) > 0
    assert len(req_data["non_functional_requirements"]) > 0
    assert len(req_data["user_stories"]) > 0
    assert len(req_data["user_roles"]) > 0

    # Add custom requirement
    updated_fr = req_data["functional_requirements"] + [{
        "id": "FR-99",
        "title": "Hardware Security Module (HSM) Key Storage",
        "description": "Secure all cryptographic signing keys using FIPS 140-2 Level 3 HSM modules.",
        "priority": "High",
        "category": "Security"
    }]
    patch_req_res = client.put(f"/api/projects/{project_id}/requirements", json={"functional_requirements": updated_fr, "is_approved": True}, headers=headers)
    assert patch_req_res.status_code == 200

    # 4. Stage 2: SRS Generation
    srs_res = client.post(f"/api/projects/{project_id}/srs/generate", headers=headers)
    assert srs_res.status_code == 200, srs_res.text
    srs_data = srs_res.json()
    assert "Software Requirements Specification" in srs_data["full_markdown"]

    # 5. Stage 3: Architecture Generation
    arch_res = client.post(f"/api/projects/{project_id}/architecture/generate", headers=headers)
    assert arch_res.status_code == 200, arch_res.text
    arch_data = arch_res.json()
    assert len(arch_data["components"]) > 0
    assert len(arch_data["data_flows"]) > 0
    assert len(arch_data["nodes"]) > 0
    assert len(arch_data["spatial_3d_nodes"]) > 0

    # 6. Stage 4: Database & API Design Generation
    db_res = client.post(f"/api/projects/{project_id}/database/generate", headers=headers)
    assert db_res.status_code == 200, db_res.text
    db_data = db_res.json()
    assert len(db_data["entities"]) > 0
    assert "CREATE TABLE" in db_data["sql_schema_ddl"]

    # Check endpoints
    endpoints_res = client.get(f"/api/projects/{project_id}/api-design", headers=headers)
    assert endpoints_res.status_code == 200
    endpoints = endpoints_res.json()
    assert len(endpoints) > 0

    # 7. Stage 5: Code Generation
    code_res = client.post(f"/api/projects/{project_id}/code-generation/generate", json={"force_regenerate": True}, headers=headers)
    assert code_res.status_code == 200, code_res.text
    files = code_res.json()
    assert len(files) >= 5
    file_paths = [f["path"] for f in files]
    assert any("main.py" in p for p in file_paths)
    assert any("App.tsx" in p for p in file_paths)

    # 8. Stage 6: Workspace IDE Operations
    tree_res = client.get(f"/api/projects/{project_id}/workspace/tree", headers=headers)
    assert tree_res.status_code == 200

    # Edit main file
    main_file = next(f for f in files if "main.py" in f["path"])
    edit_res = client.put(f"/api/projects/{project_id}/workspace/files/{main_file['id']}", json={"content": "# Custom FinTech Main\n" + main_file["content"]}, headers=headers)
    assert edit_res.status_code == 200
    assert edit_res.json()["is_user_edited"] is True

    # 9. Stage 7: Quality Review & Tests
    review_res = client.post(f"/api/projects/{project_id}/reviews/run", headers=headers)
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert review_data["total_issues"] > 0

    # Apply a review fix
    first_issue_id = review_data["issues"][0]["id"]
    fix_res = client.post(f"/api/projects/{project_id}/reviews/apply-fix/{first_issue_id}", headers=headers)
    assert fix_res.status_code == 200
    fixed_review = fix_res.json()
    applied_issue = next(i for i in fixed_review["issues"] if i["id"] == first_issue_id)
    assert applied_issue["is_applied"] is True

    test_run_res = client.post(f"/api/projects/{project_id}/reviews/tests/run", headers=headers)
    assert test_run_res.status_code == 200
    test_run_data = test_run_res.json()
    assert test_run_data["passed_count"] > 0

    # 10. Stage 8: Documentation Generation
    docs_res = client.post(f"/api/projects/{project_id}/docs/generate", headers=headers)
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 3

    # 11. Stage 9: Export Sanitized ZIP Archive
    export_res = client.get(f"/api/projects/{project_id}/export/zip", headers=headers)
    assert export_res.status_code == 200
    assert export_res.headers["content-type"] == "application/zip"
    zip_bytes = export_res.content

    # Inspect ZIP in-memory
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        namelist = zf.namelist()
        assert len(namelist) > 0
        # Verify no sensitive leaks
        for name in namelist:
            assert not name.endswith(".pyc")
            assert "__pycache__" not in name
            assert not name.endswith("/.env")
            assert not name == ".env"
            assert "node_modules" not in name

    # Verify project status
    final_proj_res = client.get(f"/api/projects/{project_id}", headers=headers)
    assert final_proj_res.status_code == 200
