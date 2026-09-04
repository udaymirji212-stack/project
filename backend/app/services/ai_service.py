import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.services.prompt_templates import (
    REQUIREMENT_SYSTEM_PROMPT,
    SRS_SYSTEM_PROMPT,
    ARCHITECTURE_SYSTEM_PROMPT,
    DATABASE_API_SYSTEM_PROMPT,
    CODE_REVIEW_SYSTEM_PROMPT,
)
from app.services.domain_analyzer import DomainAnalyzer

logger = logging.getLogger("ai_service")


class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL.rstrip("/")
        self.model = settings.OPENAI_MODEL
        self.timeout = settings.AI_TIMEOUT_SECONDS

    async def _call_openai_api(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"OpenAI API returned status {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.warning(f"Failed to communicate with OpenAI API: {e}")
            return None

    async def analyze_requirements(
        self,
        project_name: str,
        idea: str,
        target_users: str = "",
        problem: str = "",
        features: str = "",
        stack: str = "",
    ) -> Dict[str, Any]:
        user_prompt = f"""
Project Name: {project_name}
Business Idea: {idea}
Target Users: {target_users}
Core Problem: {problem}
Expected Features: {features}
Preferred Tech Stack: {stack}
"""
        external_result = await self._call_openai_api(REQUIREMENT_SYSTEM_PROMPT, user_prompt)
        if external_result:
            try:
                clean_json = external_result.strip()
                if clean_json.startswith("```"):
                    clean_json = clean_json.split("\n", 1)[1]
                    clean_json = clean_json.rsplit("\n```", 1)[0]
                parsed = json.loads(clean_json)
                if "functional_requirements" in parsed and parsed["functional_requirements"]:
                    return parsed
            except Exception as e:
                logger.warning(f"Failed to parse OpenAI response: {e}")

        # Extract deep domain profile
        profile = DomainAnalyzer.analyze_project(
            project_name=project_name,
            idea=idea,
            target_users=target_users,
            problem=problem,
            features=features,
            stack=stack,
        )

        sanitized_name = project_name.strip()
        functional_requirements = profile.get("functional_requirements", [])

        non_functional_requirements = [
            {
                "id": "NFR-01",
                "title": "Sub-150ms P95 API Latency",
                "description": "95% of database read and mutation endpoints must complete under 150ms under operational load.",
                "category": "Performance",
            },
            {
                "id": "NFR-02",
                "title": "Zero Plaintext Secret Exposure & Argon2/Bcrypt",
                "description": "Enforce strict Argon2/bcrypt password hashing, encrypted token storage, and OWASP Top 10 compliance.",
                "category": "Security",
            },
            {
                "id": "NFR-03",
                "title": "Horizontal Containerized Scalability",
                "description": "Stateless backend architecture deployable across container clusters with connection pooling.",
                "category": "Scalability",
            },
            {
                "id": "NFR-04",
                "title": "High Availability & Graceful Degradation",
                "description": "The system must maintain 99.9% uptime with circuit breakers for external service integrations.",
                "category": "Reliability",
            },
            {
                "id": "NFR-05",
                "title": "Responsive Accessibility (WCAG 2.1 AA)",
                "description": "User interface must be fully accessible across mobile, tablet, and desktop with keyboard navigation.",
                "category": "Usability",
            },
        ]

        user_roles = [
            {
                "id": "ROLE-01",
                "role_name": "Standard Domain User",
                "description": f"Registered user who creates and interacts with {profile.get('primary_entity', 'resources')}.",
                "permissions": ["CREATE_RESOURCES", "READ_OWN_RESOURCES", "UPDATE_OWN_RESOURCES", "EXPORT_DATA"],
            },
            {
                "id": "ROLE-02",
                "role_name": "Platform Administrator",
                "description": "System manager with oversight over platform health, tenant accounts, and configuration.",
                "permissions": ["ALL_PERMISSIONS", "MANAGE_USERS", "VIEW_SYSTEM_METRICS", "AUDIT_RECORDS"],
            },
        ]

        user_stories = [
            {
                "id": "US-01",
                "as_a": target_users or "Domain Operator",
                "i_want": f"to use {sanitized_name} to resolve: {problem or 'manual workflow overhead'}",
                "so_that": "I can automate critical domain tasks, minimize errors, and inspect real-time metrics.",
                "acceptance_criteria": [
                    "User can onboard and authenticate in under 1 minute.",
                    "Input parameters and schemas are validated synchronously with clear error feedback.",
                    "System generates reliable output that can be inspected, updated, and exported.",
                ],
            },
            {
                "id": "US-02",
                "as_a": "Workspace Collaborator",
                "i_want": f"to manage and query {profile.get('primary_entity', 'records')} with live filters",
                "so_that": "the team maintains accurate records and audit compliance.",
                "acceptance_criteria": [
                    "Changes are persisted immediately to the transactional database.",
                    "Exported bundles contain valid source code and schemas.",
                    "Workspace provides real-time status badges and pagination.",
                ],
            },
        ]

        risks_assumptions = {
            "risks": [
                "External third-party API rate limits during peak operational traffic.",
                "Schema migration conflicts when upgrading custom data models.",
                "Token expiration handling during long interactive sessions.",
            ],
            "assumptions": [
                "Clients have modern web browsers with WebGL/CSS3 support.",
                "Relational database (SQLite/PostgreSQL) is accessible with low latency.",
                "JWT private secret is securely managed via environment variables.",
            ],
            "missing_info": [
                "Third-party webhook endpoints or payment gateway keys.",
                "Jurisdiction-specific compliance policies (e.g. HIPAA, GDPR, SOC2).",
            ],
        }

        return {
            "functional_requirements": functional_requirements,
            "non_functional_requirements": non_functional_requirements,
            "user_roles": user_roles,
            "user_stories": user_stories,
            "risks_assumptions": risks_assumptions,
        }

    async def generate_srs(
        self,
        project_name: str,
        idea: str,
        req_data: Dict[str, Any],
        tech_stack: str = "",
    ) -> Dict[str, str]:
        user_prompt = f"Project: {project_name}\nIdea: {idea}\nStack: {tech_stack}\nRequirements: {json.dumps(req_data, indent=2)}"
        external_result = await self._call_openai_api(SRS_SYSTEM_PROMPT, user_prompt)
        
        intro = f"This document specifies the Software Requirements Specification (SRS) for **{project_name}**, engineered specifically for: {idea}. It covers full functional capabilities, performance guarantees, security architecture, and system interfaces."
        purpose = f"The primary purpose of {project_name} is to provide a robust, automated, and secure digital platform. This document serves as the formal contractual agreement between stakeholders, product managers, and software engineers."
        scope = f"{project_name} encompasses end-to-end user workflows including authentication, data modeling, automated validation, real-time analytics, and export mechanisms built upon {tech_stack or 'React + FastAPI + PostgreSQL'}."
        user_classes = "The primary user classes include Registered Business Users, Operations Personnel, and Platform Administrators with granular role-based access control."
        
        fr_text = "\n".join([f"- **[{item['id']}] {item['title']}** (Priority: {item['priority']}): {item['description']}" for item in req_data.get("functional_requirements", [])])
        nfr_text = "\n".join([f"- **[{item['id']}] {item['title']}** ({item['category']}): {item['description']}" for item in req_data.get("non_functional_requirements", [])])
        ext_interfaces = "The system exposes RESTful JSON APIs over TLS 1.3, responsive HTML5/React single page applications, and structured database schemas with connection pooling."
        data_reqs = "Relational integrity is maintained via foreign keys, unique indexes, UUID primary keys, and UTC ISO-8601 timestamps across all entities."
        sec_reqs = "All passwords hashed via bcrypt (cost 12), JWT Bearer token authentication with short-lived access tokens (60 min) and rotating refresh tokens (7 days). CORS origins strictly whitelisted."
        constraints = f"Backend developed with Python/FastAPI; Frontend built with React 18 & TypeScript; Containerization via Docker & Docker Compose; Minimal external dependencies."
        acceptance = "100% of defined functional requirements must pass automated integration test suites with zero high/critical security vulnerabilities."

        full_md = f"""# Software Requirements Specification (SRS)
## Project: {project_name}
**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Technology Stack:** {tech_stack or 'React + FastAPI + PostgreSQL'}

---

## 1. Introduction
{intro}

## 2. Purpose & Target Audience
{purpose}

## 3. Scope of the System
{scope}

## 4. User Classes & Persona Profiles
{user_classes}

## 5. Detailed Functional Requirements
{fr_text}

## 6. Non-Functional Requirements & SLAs
{nfr_text}

## 7. External Interface Requirements
{ext_interfaces}

## 8. Data & Storage Requirements
{data_reqs}

## 9. Security & Compliance Specifications
{sec_reqs}

## 10. Technical Constraints & Design Rules
{constraints}

## 11. Acceptance Criteria & Verification Matrix
{acceptance}
"""
        return {
            "title": f"{project_name} — Software Requirements Specification",
            "introduction": intro,
            "purpose": purpose,
            "scope": scope,
            "user_classes": user_classes,
            "functional_requirements_text": fr_text,
            "non_functional_requirements_text": nfr_text,
            "external_interfaces": ext_interfaces,
            "data_requirements": data_reqs,
            "security_requirements": sec_reqs,
            "constraints": constraints,
            "acceptance_criteria": acceptance,
            "full_markdown": full_md,
        }

    async def generate_architecture(self, project_name: str, idea: str, tech_stack: str = "") -> Dict[str, Any]:
        profile = DomainAnalyzer.analyze_project(
            project_name=project_name,
            idea=idea,
            stack=tech_stack,
        )

        return {
            "overview": f"Decoupled, horizontally scalable architecture for {project_name} ({profile.get('domain', 'enterprise')} domain) separating presentation, core gateway services, domain automation, and relational persistence.",
            "pattern": "Layered Micro-modular Architecture",
            "components": profile["components"],
            "nodes": profile["nodes"],
            "edges": profile["edges"],
            "data_flows": profile["data_flows"],
            "spatial_3d_nodes": profile["spatial_3d_nodes"],
        }

    async def generate_database_and_api(self, project_name: str, idea: str, req_data: Dict[str, Any]) -> Dict[str, Any]:
        profile = DomainAnalyzer.analyze_project(
            project_name=project_name,
            idea=idea,
        )

        # Include basic users table if not already present
        user_entity = {
            "name": "User",
            "table_name": "users",
            "description": "Registered system users and credential authenticators",
            "fields": [
                {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Primary unique key"},
                {"name": "email", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Unique email address"},
                {"name": "full_name", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "User display name"},
                {"name": "hashed_password", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Bcrypt hashed password"},
                {"name": "is_active", "type": "BOOLEAN", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "true", "description": "Account status flag"},
                {"name": "created_at", "type": "TIMESTAMP WITH TIME ZONE", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "NOW()", "description": "Creation timestamp"},
            ],
            "indexes": ["idx_users_email"],
            "relations": [
                {"target_entity": profile.get("primary_entity", "Record"), "type": "one-to-many", "foreign_key": "user_id", "on_delete": "CASCADE"}
            ],
        }

        all_entities = [user_entity] + profile["entities"]

        relationships = [
            {"source": "User", "target": profile.get("primary_entity", "Record"), "type": "1:N", "foreign_key": "user_id", "label": "creates and manages"}
        ]

        indexes = [
            {"table": "users", "name": "idx_users_email", "type": "UNIQUE INDEX", "columns": ["email"]}
        ]
        for ent in profile["entities"]:
            for idx in ent.get("indexes", []):
                indexes.append({"table": ent.get("table_name", ent["name"].lower()), "name": idx, "type": "INDEX", "columns": ["user_id"]})

        return {
            "database": {
                "database_type": "PostgreSQL / SQLite Compatible",
                "entities": all_entities,
                "relationships": relationships,
                "indexes_and_constraints": indexes,
                "sql_schema_ddl": profile["sql_ddl"],
            },
            "endpoints": profile["endpoints"],
        }


ai_service = AIService()
