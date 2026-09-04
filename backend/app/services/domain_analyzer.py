import re
from typing import Dict, Any, List, Optional


class DomainAnalyzer:
    """
    Intelligent domain analysis engine that parses user ideas, feature lists,
    target users, and technical constraints to synthesize realistic, domain-specific
    architectures, database entities, and full-stack code.
    """

    DOMAINS = {
        "fintech": ["fintech", "finance", "money", "wealth", "expense", "budget", "invoice", "payment", "bank", "crypto", "trading", "investment", "tax", "billing", "subscription", "wallet"],
        "healthtech": ["health", "med", "doctor", "patient", "clinic", "hospital", "telehealth", "ehr", "emr", "prescription", "triage", "therapy", "clinical", "pharmacy", "vital"],
        "ecommerce": ["ecommerce", "e-commerce", "shop", "store", "product", "cart", "order", "inventory", "marketplace", "checkout", "retail", "vendor", "shipping"],
        "ai_knowledge": ["rag", "llm", "ai", "document", "knowledge", "vector", "embedding", "semantic", "search", "citation", "nlp", "prompt", "summariz"],
        "devops_saas": ["saas", "devops", "cloud", "monitor", "metric", "deploy", "pipeline", "ci/cd", "log", "incident", "server", "cluster", "kubernetes", "api gateway", "observability", "uptime"],
        "edtech": ["education", "course", "student", "teacher", "quiz", "lesson", "school", "lms", "learning", "grade", "assignment", "academy", "curriculum"],
        "logistics": ["logistic", "fleet", "driver", "vehicle", "warehouse", "freight", "route", "package", "delivery", "dispatch", "tracking", "cargo", "supply chain"],
        "realestate": ["real estate", "property", "tenant", "landlord", "rent", "lease", "apartment", "listing", "mortgage", "realtor", "housing"],
        "social_crm": ["crm", "customer", "lead", "contact", "deal", "pipeline", "sales", "social", "community", "chat", "message", "feed", "forum"]
    }

    @classmethod
    def detect_domain(cls, text: str) -> str:
        lowered = text.lower()
        scores = {}
        for domain, keywords in cls.DOMAINS.items():
            score = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw), lowered))
            if score > 0:
                scores[domain] = score
        if scores:
            return max(scores, key=scores.get)
        return "custom_enterprise"

    @classmethod
    def analyze_project(
        cls,
        project_name: str,
        idea: str,
        target_users: str = "",
        problem: str = "",
        features: str = "",
        stack: str = "",
    ) -> Dict[str, Any]:
        combined_text = f"{project_name} {idea} {features} {problem} {target_users}"
        domain = cls.detect_domain(combined_text)

        # Extract custom feature keywords
        user_features = [f.strip() for f in re.split(r'[,;\n]+', features) if f.strip() and len(f.strip()) > 3]

        if domain == "fintech":
            return cls._build_fintech_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "healthtech":
            return cls._build_healthtech_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "ai_knowledge":
            return cls._build_ai_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "ecommerce":
            return cls._build_ecommerce_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "logistics":
            return cls._build_logistics_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "edtech":
            return cls._build_edtech_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "devops_saas":
            return cls._build_devops_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "realestate":
            return cls._build_realestate_profile(project_name, idea, target_users, problem, user_features, stack)
        elif domain == "social_crm":
            return cls._build_social_profile(project_name, idea, target_users, problem, user_features, stack)
        else:
            return cls._build_enterprise_profile(project_name, idea, target_users, problem, user_features, stack)

    # -------------------------------------------------------------------------
    # 1. FINTECH PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_fintech_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        entities = [
            {
                "name": "Account",
                "table_name": "accounts",
                "description": "User bank accounts, investment wallets, and credit facilities",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Account unique ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Foreign key to User"},
                    {"name": "account_name", "type": "VARCHAR(100)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Account display title"},
                    {"name": "account_type", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'checking'", "description": "checking, savings, investment, credit"},
                    {"name": "currency", "type": "VARCHAR(10)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'USD'", "description": "ISO-4217 Currency Code"},
                    {"name": "balance", "type": "NUMERIC(15,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0.00", "description": "Current cleared balance"},
                    {"name": "is_active", "type": "BOOLEAN", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "true", "description": "Active status"}
                ],
                "indexes": ["idx_accounts_user_id"],
                "relations": [{"target_entity": "Transaction", "type": "one-to-many", "foreign_key": "account_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "Transaction",
                "table_name": "transactions",
                "description": "Financial debit/credit transactions, merchant records, and categorizations",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Transaction ID"},
                    {"name": "account_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Source Account ID"},
                    {"name": "amount", "type": "NUMERIC(15,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Transaction monetary amount"},
                    {"name": "transaction_type", "type": "VARCHAR(20)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'debit'", "description": "debit or credit"},
                    {"name": "category", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'General'", "description": "AI-categorized expense category"},
                    {"name": "merchant", "type": "VARCHAR(150)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Merchant or payee entity"},
                    {"name": "status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'completed'", "description": "pending, completed, flagged"},
                    {"name": "transaction_date", "type": "TIMESTAMP WITH TIME ZONE", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "NOW()", "description": "Transaction timestamp"}
                ],
                "indexes": ["idx_tx_account_date", "idx_tx_category"],
                "relations": [{"target_entity": "Account", "type": "many-to-one", "foreign_key": "account_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "BudgetForecast",
                "table_name": "budget_forecasts",
                "description": "AI-generated monthly expense forecasts and subscription creep alerts",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Forecast ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "User ID"},
                    {"name": "period_month", "type": "VARCHAR(20)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "e.g. 2026-10"},
                    {"name": "predicted_spend", "type": "NUMERIC(15,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0.00", "description": "Predicted total spend"},
                    {"name": "recurring_subscriptions_total", "type": "NUMERIC(15,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0.00", "description": "Total monthly subscriptions"},
                    {"name": "anomalies_detected", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0", "description": "Count of abnormal transactions"},
                    {"name": "insights_json", "type": "JSONB", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "'[]'", "description": "Structured AI insights and recommendations"}
                ],
                "indexes": ["idx_forecasts_user_period"],
                "relations": []
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Register user account", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string", "full_name": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "Log in and obtain JWT access token", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": "Accounts", "method": "GET", "path": "/api/accounts", "summary": "List all financial accounts for user", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "account_name": "string", "account_type": "string", "balance": "number", "currency": "string"}]},
            {"tag": "Accounts", "method": "POST", "path": "/api/accounts", "summary": "Create new bank or wallet account", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"account_name": "string", "account_type": "string", "currency": "string", "balance": "number"}, "response_success_schema": {"id": "uuid", "account_name": "string", "balance": "number"}},
            {"tag": "Transactions", "method": "GET", "path": "/api/transactions", "summary": "Query transactions with category/date filtering", "auth_required": True, "required_role": "authenticated", "query_params": [{"name": "account_id", "type": "uuid", "required": False}, {"name": "category", "type": "string", "required": False}], "response_success_schema": [{"id": "uuid", "amount": "number", "merchant": "string", "category": "string", "transaction_date": "datetime"}]},
            {"tag": "Transactions", "method": "POST", "path": "/api/transactions", "summary": "Record new transaction with automatic balance update", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"account_id": "uuid", "amount": "number", "transaction_type": "string", "merchant": "string", "category": "string"}, "response_success_schema": {"id": "uuid", "amount": "number", "status": "string"}},
            {"tag": "Transactions", "method": "DELETE", "path": "/api/transactions/{id}", "summary": "Delete transaction and recalculate balance", "auth_required": True, "required_role": "authenticated", "path_params": [{"name": "id", "type": "uuid", "required": True}], "response_success_schema": {"success": True}},
            {"tag": "AI Analytics", "method": "POST", "path": "/api/forecasts/generate", "summary": "Trigger AI monthly spend forecast & anomaly check", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"period_month": "string"}, "response_success_schema": {"period_month": "string", "predicted_spend": "number", "recurring_subscriptions_total": "number", "insights_json": "array"}}
        ]

        components = [
            {"id": "comp-frontend", "name": "Wealth & Portfolio Dashboard SPA", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + TypeScript + Recharts", "responsibilities": ["Live wealth visualizer", "Real-time expense stream", "Budget forecasting interactive charts"], "data_flow_in": ["User transaction inputs", "API JSON payloads"], "data_flow_out": ["JWT Authenticated REST queries"]},
            {"id": "comp-compliance", "name": "Compliance & Audit Portal", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Monaco Editor", "responsibilities": ["Regulatory transaction review", "Suspicious activity reporting (SAR)", "Ledger reconciliation"], "data_flow_in": ["Audit logs", "Flagged transactions"], "data_flow_out": ["Compliance approvals"]},
            {"id": "comp-gateway", "name": "Zero-Trust Financial Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + Reverse Proxy + mTLS", "responsibilities": ["Account ledger routing", "Double-entry balance verification", "JWT auth, rate limiting & 2FA"], "data_flow_in": ["REST HTTP/S requests"], "data_flow_out": ["SQLAlchemy DB queries", "Forecast job requests"]},
            {"id": "comp-ledger-core", "name": "Double-Entry Ledger Engine", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + Pydantic v2", "responsibilities": ["Atomic debit/credit ledger states", "Currency exchange conversion", "Fee calculations"], "data_flow_in": ["Validated payment DTOs"], "data_flow_out": ["ACID transaction writes"]},
            {"id": "comp-forecast-engine", "name": "AI Cashflow & Fraud Forecaster", "type": "AI Service", "layer": "Domain Intelligence", "tech": "ML / LLM Predictive Forecaster", "responsibilities": ["Predict monthly burn rate", "Detect stealth recurring subscriptions", "Categorize raw merchant strings"], "data_flow_in": ["Transaction historical batches"], "data_flow_out": ["Forecast metrics & anomaly flags"]},
            {"id": "comp-bank-worker", "name": "Bank Sync & Ingestion Worker", "type": "Worker", "layer": "Async Processing", "tech": "Async Celery / Redis Queue", "responsibilities": ["Plaid / OpenBanking statement fetch", "Background balance synchronization", "Webhook parsing"], "data_flow_in": ["Bank sync events"], "data_flow_out": ["Ingested ledger entries"]},
            {"id": "comp-ledger-db", "name": "Financial Ledger ACID Store", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16 (Strict ACID)", "responsibilities": ["Atomic balance transitions", "Immutable transaction audit logs", "High-precision numeric types"], "data_flow_in": ["SQL Queries & write operations"], "data_flow_out": ["Financial recordsets"]},
            {"id": "comp-vault", "name": "AES-256 Key Vault & Audit Store", "type": "Security", "layer": "Security & Encryption", "tech": "HashiCorp Vault / KMS + Append-Only Log", "responsibilities": ["Encryption key rotation", "Card tokenization vault", "Cryptographically signed audit trail"], "data_flow_in": ["Tokenize requests"], "data_flow_out": ["Encrypted tokens"]},
            {"id": "comp-cache", "name": "Redis Ephemeral & Rate Limit Cache", "type": "Cache", "layer": "Caching & Queues", "tech": "Redis 7.2 Cluster", "responsibilities": ["User session store", "Sub-millisecond token blacklisting", "API rate limiting counters"], "data_flow_in": ["Cache keys"], "data_flow_out": ["Cached sessions"]},
            {"id": "comp-infra", "name": "Hardened Docker & Vault Runtime", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose + TLS 1.3 Termination", "responsibilities": ["AES-256 encrypted storage volumes", "Sub-100ms API routing", "Health monitoring telemetry"], "data_flow_in": ["Health probes"], "data_flow_out": ["Metric streams"]}
        ]

        nodes = [
            {"id": "node-client", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": "Wealth Dashboard SPA", "category": "Frontend", "tech": "React + TypeScript", "description": "Interactive ledger & budget charts"}},
            {"id": "node-compliance", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Compliance Console", "category": "Frontend", "tech": "React + Monaco", "description": "Audit trail & regulatory checks"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "Zero-Trust Financial Gateway", "category": "Gateway", "tech": "FastAPI + mTLS + 2FA", "description": "Double-entry routing & rate limits"}},
            {"id": "node-ledger", "type": "customNode", "position": {"x": 640, "y": 60}, "data": {"label": "Ledger Core Engine", "category": "Backend", "tech": "FastAPI + Pydantic", "description": "Atomic debit/credit accounting"}},
            {"id": "node-ai", "type": "customNode", "position": {"x": 640, "y": 200}, "data": {"label": "Cashflow AI Forecaster", "category": "AI Service", "tech": "Predictive Core", "description": "Burn rate & fraud anomaly detector"}},
            {"id": "node-worker", "type": "customNode", "position": {"x": 640, "y": 340}, "data": {"label": "Bank Ingestion Worker", "category": "Worker", "tech": "Async Celery Worker", "description": "Plaid webhooks & bank statement sync"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 60}, "data": {"label": "ACID PostgreSQL Ledger", "category": "Database", "tech": "PostgreSQL 16", "description": "Immutable double-entry records"}},
            {"id": "node-vault", "type": "customNode", "position": {"x": 960, "y": 200}, "data": {"label": "AES-256 Key Vault", "category": "Security", "tech": "KMS / Vault", "description": "Encrypted audit vault & token store"}},
            {"id": "node-cache", "type": "customNode", "position": {"x": 960, "y": 340}, "data": {"label": "Redis Session Cache", "category": "Cache", "tech": "Redis 7.2", "description": "Rate limiting & fast token check"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "Hardened Docker Hub", "category": "Deployment", "tech": "Docker Compose", "description": "Isolated container runtime with TLS 1.3"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-client", "target": "node-gateway", "label": "HTTPS / JSON (JWT)", "animated": True},
            {"id": "e-2", "source": "node-compliance", "target": "node-gateway", "label": "mTLS / Audit Stream", "animated": True},
            {"id": "e-3", "source": "node-gateway", "target": "node-ledger", "label": "Transactional Commands", "animated": True},
            {"id": "e-4", "source": "node-gateway", "target": "node-ai", "label": "Transaction Batches", "animated": True},
            {"id": "e-5", "source": "node-gateway", "target": "node-cache", "label": "Auth Token Checks", "animated": True},
            {"id": "e-6", "source": "node-ledger", "target": "node-db", "label": "ACID SQL Queries", "animated": True},
            {"id": "e-7", "source": "node-ledger", "target": "node-vault", "label": "Signed Audit Trail", "animated": True},
            {"id": "e-8", "source": "node-worker", "target": "node-ledger", "label": "Reconciled Events", "animated": True},
            {"id": "e-9", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-10", "source": "node-infra", "target": "node-db", "label": "Encrypted Storage", "animated": False}
        ]

        data_flows = [
            {"from_component": "Wealth & Portfolio Dashboard SPA", "to_component": "Zero-Trust Financial Gateway", "protocol": "HTTPS / JSON", "payload": "JWT Bearer, Transaction Payloads", "description": "User ledger operations"},
            {"from_component": "Zero-Trust Financial Gateway", "to_component": "Double-Entry Ledger Engine", "protocol": "gRPC / REST", "payload": "Validated Ledger Commands", "description": "Accounting transactions"},
            {"from_component": "Double-Entry Ledger Engine", "to_component": "Financial Ledger ACID Store", "protocol": "PostgreSQL Wire", "payload": "Parameterized ACID SQL", "description": "Immutable balance mutations"},
            {"from_component": "Zero-Trust Financial Gateway", "to_component": "AI Cashflow & Fraud Forecaster", "protocol": "Internal RPC", "payload": "Historical transaction series", "description": "Forecast & fraud evaluation"},
            {"from_component": "Bank Sync & Ingestion Worker", "to_component": "Double-Entry Ledger Engine", "protocol": "Event Queue", "payload": "Plaid Bank Statement DTO", "description": "Automatic transaction import"},
            {"from_component": "Double-Entry Ledger Engine", "to_component": "AES-256 Key Vault & Audit Store", "protocol": "mTLS / Vault API", "payload": "Encrypted Signatures", "description": "Compliance record archiving"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-frontend", "label": "Wealth SPA", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-compliance", "label": "Compliance Console", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "Zero-Trust Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-ledger", "label": "Ledger Engine", "category": "Backend", "position": [1.0, 1.5, 0], "color": "#84CC16"},
            {"id": "3d-ai", "label": "AI Forecaster", "category": "AI Service", "position": [1.0, 0, 0], "color": "#38BDF8"},
            {"id": "3d-worker", "label": "Bank Worker", "category": "Worker", "position": [1.0, -1.5, 0], "color": "#F59E0B"},
            {"id": "3d-db", "label": "ACID PostgreSQL", "category": "Database", "position": [3.8, 1.5, 0], "color": "#EC4899"},
            {"id": "3d-vault", "label": "Key Vault", "category": "Security", "position": [3.8, 0, 0], "color": "#14B8A6"},
            {"id": "3d-cache", "label": "Redis Cache", "category": "Cache", "position": [3.8, -1.5, 0], "color": "#F43F5E"},
            {"id": "3d-docker", "label": "Docker Infra", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = """-- Auto-Generated PostgreSQL Schema for FinTech Domain
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'checking',
    currency VARCHAR(10) DEFAULT 'USD',
    balance NUMERIC(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'debit',
    category VARCHAR(50) DEFAULT 'General',
    merchant VARCHAR(150) NOT NULL,
    status VARCHAR(30) DEFAULT 'completed',
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_month VARCHAR(20) NOT NULL,
    predicted_spend NUMERIC(15,2) DEFAULT 0.00,
    recurring_subscriptions_total NUMERIC(15,2) DEFAULT 0.00,
    anomalies_detected INTEGER DEFAULT 0,
    insights_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_tx_account_date ON transactions(account_id, transaction_date);
CREATE INDEX idx_tx_category ON transactions(category);
"""

        functional_reqs = [
            {"id": "FR-01", "title": "Multi-Account Ledger Management", "description": "Users can link and manage checking, savings, investment, and credit accounts with real-time balance aggregation.", "priority": "High", "category": "Account & Ledger"},
            {"id": "FR-02", "title": "Automated Transaction Ingestion & Categorization", "description": "Parse manual entries and CSV statements, categorizing merchant expenses via automated classification.", "priority": "High", "category": "Transactions"},
            {"id": "FR-03", "title": "AI Cashflow & Subscription Creep Forecasting", "description": "Predict next month's burn rate and automatically highlight recurring subscriptions with pricing creeps.", "priority": "High", "category": "AI Analytics"},
            {"id": "FR-04", "title": "Multi-Currency & Real-Time FX Conversion", "description": "Support international currencies with automatic base-currency ledger consolidation.", "priority": "Medium", "category": "Treasury"},
            {"id": "FR-05", "title": "Tax Summary & PDF/CSV Financial Export", "description": "Generate audit-ready transaction summaries, tax category reports, and balance statements.", "priority": "Medium", "category": "Reporting"}
        ]

        return {
            "domain": "fintech",
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": "Transaction",
            "secondary_entity": "Account"
        }

    # -------------------------------------------------------------------------
    # 2. HEALTHTECH PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_healthtech_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        entities = [
            {
                "name": "Patient",
                "table_name": "patients",
                "description": "Patient demographic records, medical history, and emergency contact details",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Patient unique ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Foreign key to User profile"},
                    {"name": "medical_record_number", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Unique hospital MRN"},
                    {"name": "date_of_birth", "type": "VARCHAR(20)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "DOB YYYY-MM-DD"},
                    {"name": "blood_group", "type": "VARCHAR(10)", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "'O+'", "description": "Patient blood type"},
                    {"name": "allergies_json", "type": "JSONB", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "'[]'", "description": "Documented medical allergies"},
                    {"name": "emergency_contact", "type": "VARCHAR(100)", "is_primary": False, "is_nullable": True, "is_unique": False, "default": None, "description": "Emergency phone/name"}
                ],
                "indexes": ["idx_patients_mrn"],
                "relations": [{"target_entity": "Appointment", "type": "one-to-many", "foreign_key": "patient_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "Appointment",
                "table_name": "appointments",
                "description": "Telehealth consultation schedules, triage severity, and WebRTC room sessions",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Appointment ID"},
                    {"name": "patient_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Patient foreign key"},
                    {"name": "doctor_name", "type": "VARCHAR(100)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'Dr. Medical Specialist'", "description": "Assigned doctor"},
                    {"name": "scheduled_time", "type": "TIMESTAMP WITH TIME ZONE", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "NOW()", "description": "Appointment start time"},
                    {"name": "status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'scheduled'", "description": "scheduled, in_progress, completed, cancelled"},
                    {"name": "triage_severity", "type": "VARCHAR(20)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'Routine'", "description": "Emergency, Urgent, Routine"},
                    {"name": "chief_complaint", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Primary clinical complaint"},
                    {"name": "consultation_notes", "type": "TEXT", "is_primary": False, "is_nullable": True, "is_unique": False, "default": None, "description": "Doctor encrypted clinical notes"}
                ],
                "indexes": ["idx_appts_patient_time", "idx_appts_status"],
                "relations": [{"target_entity": "Patient", "type": "many-to-one", "foreign_key": "patient_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "Prescription",
                "table_name": "prescriptions",
                "description": "Digital medication orders, dosage instructions, and pharmacy fulfillment status",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Prescription ID"},
                    {"name": "appointment_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Associated appointment"},
                    {"name": "medication_name", "type": "VARCHAR(150)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Pharmaceutical drug name"},
                    {"name": "dosage", "type": "VARCHAR(100)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'1 tablet daily'", "description": "Dosage & frequency"},
                    {"name": "duration_days", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "7", "description": "Course duration in days"},
                    {"name": "dispense_status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'pending'", "description": "pending, dispensed, refilled"}
                ],
                "indexes": ["idx_presc_appointment"],
                "relations": []
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Register clinical user account", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string", "full_name": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "Doctor/Patient login", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": "Patients", "method": "GET", "path": "/api/patients", "summary": "List clinical patient records", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "medical_record_number": "string", "blood_group": "string"}]},
            {"tag": "Patients", "method": "POST", "path": "/api/patients", "summary": "Enroll new patient intake profile", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"date_of_birth": "string", "blood_group": "string", "emergency_contact": "string"}, "response_success_schema": {"id": "uuid", "medical_record_number": "string"}},
            {"tag": "Appointments", "method": "GET", "path": "/api/appointments", "summary": "Fetch scheduled telehealth consultations", "auth_required": True, "required_role": "authenticated", "query_params": [{"name": "status", "type": "string", "required": False}], "response_success_schema": [{"id": "uuid", "doctor_name": "string", "scheduled_time": "datetime", "status": "string", "triage_severity": "string"}]},
            {"tag": "Appointments", "method": "POST", "path": "/api/appointments", "summary": "Book consultation appointment with triage intake", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"patient_id": "uuid", "doctor_name": "string", "scheduled_time": "string", "chief_complaint": "string", "triage_severity": "string"}, "response_success_schema": {"id": "uuid", "status": "string"}},
            {"tag": "Appointments", "method": "PUT", "path": "/api/appointments/{id}/status", "summary": "Update consultation status and doctor clinical notes", "auth_required": True, "required_role": "authenticated", "path_params": [{"name": "id", "type": "uuid", "required": True}], "request_body_schema": {"status": "string", "consultation_notes": "string"}, "response_success_schema": {"id": "uuid", "status": "string"}},
            {"tag": "Prescriptions", "method": "POST", "path": "/api/prescriptions", "summary": "Issue digital e-prescription", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"appointment_id": "uuid", "medication_name": "string", "dosage": "string", "duration_days": "integer"}, "response_success_schema": {"id": "uuid", "medication_name": "string", "dispense_status": "string"}}
        ]

        components = [
            {"id": "comp-patient", "name": "Patient Telehealth Portal", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + WebRTC Client", "responsibilities": ["Symptom intake triage", "One-click video room join", "Prescription & summary viewer"], "data_flow_in": ["Patient triage inputs"], "data_flow_out": ["JWT Encrypted REST API calls"]},
            {"id": "comp-doctor", "name": "Doctor Clinical EHR Console", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Tailwind", "responsibilities": ["Interactive appointment calendar", "Patient medical history viewer", "E-Prescription prescription composer"], "data_flow_in": ["EHR records"], "data_flow_out": ["Clinical updates"]},
            {"id": "comp-gateway", "name": "HIPAA Clinical API Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + OAuth2 + TLS 1.3", "responsibilities": ["HIPAA role-based access control", "Zero-trust token verification", "Audit trace injection"], "data_flow_in": ["REST HTTP/S clinical requests"], "data_flow_out": ["Service requests"]},
            {"id": "comp-triage", "name": "Triage & Scheduling Core", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + Pydantic v2", "responsibilities": ["Clinical severity scoring", "Doctor calendar conflict resolution", "Appointment state machine"], "data_flow_in": ["Booking DTOs"], "data_flow_out": ["Encrypted DB transactions"]},
            {"id": "comp-webrtc", "name": "WebRTC Video Signaling Relay", "type": "Media Service", "layer": "Real-Time Comms", "tech": "WebRTC / WebSocket STUN/TURN", "responsibilities": ["P2P video session negotiation", "E2E encrypted doctor-patient media stream", "Call duration telemetry"], "data_flow_in": ["SDP offers & ICE candidates"], "data_flow_out": ["Session health metrics"]},
            {"id": "comp-rx", "name": "E-Prescription & Pharmacy Dispatcher", "type": "Worker", "layer": "Async Processing", "tech": "Async Celery Worker", "responsibilities": ["Digital signature verification", "Pharmacy EDI dispatch", "Patient SMS notifications"], "data_flow_in": ["Prescription events"], "data_flow_out": ["Fulfillment status updates"]},
            {"id": "comp-ehr-db", "name": "HIPAA Partitioned EHR Vault", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16 + Column-level AES-256", "responsibilities": ["Encrypted medical notes & records", "Patient partition isolation", "Zero plaintext storage"], "data_flow_in": ["Encrypted SQL queries"], "data_flow_out": ["Clinical recordsets"]},
            {"id": "comp-audit", "name": "Immutable Access Audit Log Store", "type": "Security", "layer": "Security & Compliance", "tech": "Append-Only Audit DB (WORM)", "responsibilities": ["100% record access logging", "Cryptographic chain validation", "HIPAA audit report generator"], "data_flow_in": ["Audit trace payloads"], "data_flow_out": ["Compliance records"]},
            {"id": "comp-infra", "name": "HIPAA Compliant Docker Cluster", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose + Hardened Alpine", "responsibilities": ["Isolated network namespaces", "Encrypted backup rotation", "Automated health checks"], "data_flow_in": ["Container health checks"], "data_flow_out": ["Security audit metrics"]}
        ]

        nodes = [
            {"id": "node-patient", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": "Patient Telehealth Portal", "category": "Frontend", "tech": "React + WebRTC", "description": "Triage symptom intake & video UI"}},
            {"id": "node-doctor", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Doctor Clinical Console", "category": "Frontend", "tech": "React + TypeScript", "description": "EHR review & e-prescriptions"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "HIPAA Clinical Gateway", "category": "Gateway", "tech": "FastAPI + RBAC", "description": "Zero-trust clinical access control"}},
            {"id": "node-triage", "type": "customNode", "position": {"x": 640, "y": 60}, "data": {"label": "Triage & Scheduling Core", "category": "Backend", "tech": "FastAPI + Pydantic", "description": "Appointment conflict resolution"}},
            {"id": "node-webrtc", "type": "customNode", "position": {"x": 640, "y": 200}, "data": {"label": "WebRTC Media Relay", "category": "Media Service", "tech": "WebRTC STUN/TURN", "description": "E2E encrypted video consultation"}},
            {"id": "node-rx", "type": "customNode", "position": {"x": 640, "y": 340}, "data": {"label": "E-Prescription Dispatcher", "category": "Worker", "tech": "Celery Worker", "description": "Digital pharmacy order routing"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 80}, "data": {"label": "PostgreSQL EHR Vault", "category": "Database", "tech": "PostgreSQL 16 (AES-256)", "description": "Encrypted patient charts & vitals"}},
            {"id": "node-audit", "type": "customNode", "position": {"x": 960, "y": 260}, "data": {"label": "Immutable Audit Vault", "category": "Security", "tech": "WORM Audit Store", "description": "HIPAA electronic record audit logs"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "HIPAA Docker Cluster", "category": "Deployment", "tech": "Docker Compose", "description": "Hardened container mesh with TLS 1.3"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-patient", "target": "node-gateway", "label": "HTTPS / JSON (JWT)", "animated": True},
            {"id": "e-2", "source": "node-doctor", "target": "node-gateway", "label": "HTTPS / Clinical Role", "animated": True},
            {"id": "e-3", "source": "node-patient", "target": "node-webrtc", "label": "WebRTC P2P Video", "animated": True},
            {"id": "e-4", "source": "node-doctor", "target": "node-webrtc", "label": "WebRTC Video Stream", "animated": True},
            {"id": "e-5", "source": "node-gateway", "target": "node-triage", "label": "Consultation Commands", "animated": True},
            {"id": "e-6", "source": "node-triage", "target": "node-db", "label": "Encrypted SQL Operations", "animated": True},
            {"id": "e-7", "source": "node-triage", "target": "node-rx", "label": "Prescription Trigger", "animated": True},
            {"id": "e-8", "source": "node-gateway", "target": "node-audit", "label": "HIPAA Access Logs", "animated": True},
            {"id": "e-9", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-10", "source": "node-infra", "target": "node-db", "label": "Volume Isolation", "animated": False}
        ]

        data_flows = [
            {"from_component": "Patient Telehealth Portal", "to_component": "HIPAA Clinical API Gateway", "protocol": "HTTPS / JSON", "payload": "JWT Bearer, Patient DTOs", "description": "Clinical commands"},
            {"from_component": "Patient Telehealth Portal", "to_component": "WebRTC Video Signaling Relay", "protocol": "WebSockets / WSS", "payload": "SDP Offers, ICE Candidates", "description": "Video session setup"},
            {"from_component": "Triage & Scheduling Core", "to_component": "HIPAA Partitioned EHR Vault", "protocol": "PostgreSQL Wire", "payload": "Encrypted SQL Operations", "description": "Patient records persistence"},
            {"from_component": "Triage & Scheduling Core", "to_component": "E-Prescription & Pharmacy Dispatcher", "protocol": "Redis Queue", "payload": "Prescription Order Event", "description": "Pharmacy routing"},
            {"from_component": "HIPAA Clinical API Gateway", "to_component": "Immutable Access Audit Log Store", "protocol": "Syslog / mTLS", "payload": "Signed Audit Record", "description": "Compliance logging"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-patient", "label": "Patient Portal", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-doctor", "label": "Doctor Console", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "HIPAA Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-triage", "label": "Triage Core", "category": "Backend", "position": [1.0, 1.5, 0], "color": "#84CC16"},
            {"id": "3d-webrtc", "label": "WebRTC Relay", "category": "Media Service", "position": [1.0, 0, 0], "color": "#3B82F6"},
            {"id": "3d-rx", "label": "Rx Dispatcher", "category": "Worker", "position": [1.0, -1.5, 0], "color": "#F59E0B"},
            {"id": "3d-db", "label": "EHR Vault DB", "category": "Database", "position": [3.8, 0.8, 0], "color": "#EC4899"},
            {"id": "3d-audit", "label": "Audit Store", "category": "Security", "position": [3.8, -0.8, 0], "color": "#14B8A6"},
            {"id": "3d-docker", "label": "HIPAA Cluster", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = """-- Auto-Generated PostgreSQL Schema for HealthTech / Telehealth Domain
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'patient',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10) DEFAULT 'O+',
    allergies_json JSONB DEFAULT '[]'::jsonb,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(100) NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'scheduled',
    triage_severity VARCHAR(20) DEFAULT 'Routine',
    chief_complaint TEXT NOT NULL,
    consultation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    medication_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    duration_days INTEGER DEFAULT 7,
    dispense_status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_mrn ON patients(medical_record_number);
CREATE INDEX idx_appts_patient_time ON appointments(patient_id, scheduled_time);
CREATE INDEX idx_appts_status ON appointments(status);
"""

        functional_reqs = [
            {"id": "FR-01", "title": "Patient Digital Intake & EHR Profile", "description": "Patients and triage nurses can register medical profiles, allergies, and emergency contacts with automated MRN issuance.", "priority": "High", "category": "Patient Intake"},
            {"id": "FR-02", "title": "Doctor Slot Scheduling & Real-Time Booking", "description": "Interactive appointment calendar with conflict prevention and automated slot reservations.", "priority": "High", "category": "Scheduling"},
            {"id": "FR-03", "title": "Encrypted WebRTC Telehealth Video Consultations", "description": "One-click peer-to-peer browser video consultation room with end-to-end media encryption.", "priority": "High", "category": "Telehealth"},
            {"id": "FR-04", "title": "Clinical E-Prescriptions & Dosage Management", "description": "Doctors can compose digital prescriptions with dosage instructions and pharmacy routing.", "priority": "Medium", "category": "Prescriptions"},
            {"id": "FR-05", "title": "HIPAA Audit Logging & Immutable Access Trail", "description": "Record all electronic health record views, edits, and exports with timestamped user signatures.", "priority": "High", "category": "Security & Compliance"}
        ]

        return {
            "domain": "healthtech",
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": "Appointment",
            "secondary_entity": "Patient"
        }

    # -------------------------------------------------------------------------
    # 3. AI / RAG PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_ai_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        entities = [
            {
                "name": "KnowledgeDocument",
                "table_name": "knowledge_documents",
                "description": "Uploaded enterprise documents, manuals, and ingested text files",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Document ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Owner user ID"},
                    {"name": "title", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Document filename/title"},
                    {"name": "file_type", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'pdf'", "description": "pdf, docx, md, txt"},
                    {"name": "total_chunks", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0", "description": "Chunk count"},
                    {"name": "status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'indexed'", "description": "processing, indexed, error"},
                    {"name": "content_summary", "type": "TEXT", "is_primary": False, "is_nullable": True, "is_unique": False, "default": None, "description": "AI-generated executive summary"}
                ],
                "indexes": ["idx_docs_user_id"],
                "relations": [{"target_entity": "DocumentChunk", "type": "one-to-many", "foreign_key": "document_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "DocumentChunk",
                "table_name": "document_chunks",
                "description": "Granular text chunks with token bounds and vector embedding identifiers",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Chunk ID"},
                    {"name": "document_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Parent Document ID"},
                    {"name": "chunk_index", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0", "description": "Sequential chunk index"},
                    {"name": "chunk_text", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Raw text content"},
                    {"name": "token_count", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "128", "description": "Chunk token length"},
                    {"name": "embedding_dim", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "1536", "description": "Embedding vector dimensions"}
                ],
                "indexes": ["idx_chunks_doc_id"],
                "relations": [{"target_entity": "KnowledgeDocument", "type": "many-to-one", "foreign_key": "document_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "SemanticQueryLog",
                "table_name": "semantic_query_logs",
                "description": "User natural language queries, cosine similarity scores, and cited references",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Query Log ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Querying User"},
                    {"name": "query_text", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "User question"},
                    {"name": "generated_answer", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "AI synthesis with citations"},
                    {"name": "top_similarity_score", "type": "NUMERIC(5,4)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0.8920", "description": "Top chunk cosine match"},
                    {"name": "latency_ms", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "120", "description": "RAG query latency in ms"}
                ],
                "indexes": ["idx_queries_user"],
                "relations": []
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Register AI platform user", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string", "full_name": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "User login & token issue", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": "Knowledge Base", "method": "GET", "path": "/api/documents", "summary": "List indexed knowledge documents", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "title": "string", "file_type": "string", "total_chunks": "integer", "status": "string"}]},
            {"tag": "Knowledge Base", "method": "POST", "path": "/api/documents", "summary": "Upload and index new document", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"title": "string", "file_type": "string", "content_summary": "string"}, "response_success_schema": {"id": "uuid", "title": "string", "status": "string"}},
            {"tag": "Semantic Search", "method": "POST", "path": "/api/rag/search", "summary": "Execute semantic query with vector similarity & cited references", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"query_text": "string", "top_k": "integer"}, "response_success_schema": {"query_text": "string", "generated_answer": "string", "top_similarity_score": "number", "citations": "array"}},
            {"tag": "Query History", "method": "GET", "path": "/api/rag/history", "summary": "List past search and query sessions", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "query_text": "string", "generated_answer": "string", "latency_ms": "integer"}]}
        ]

        components = [
            {"id": "comp-frontend", "name": "AI Search & Citation Explorer SPA", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Tailwind CSS", "responsibilities": ["Natural language query UI", "Live cited snippet highlighter", "Confidence score badge display"], "data_flow_in": ["Streaming answers"], "data_flow_out": ["Semantic queries"]},
            {"id": "comp-admin", "name": "Document Ingestion Studio", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Monaco Editor", "responsibilities": ["Multi-file PDF/DOCX drag-and-drop", "Chunk boundary visualizer", "Embedding status inspector"], "data_flow_in": ["File uploads"], "data_flow_out": ["Raw document bytes"]},
            {"id": "comp-gateway", "name": "RAG Orchestration Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + Pydantic v2", "responsibilities": ["Query normalization & re-ranking", "Embedding generation dispatch", "Context window construction"], "data_flow_in": ["REST HTTP/S queries"], "data_flow_out": ["Vector database searches", "LLM calls"]},
            {"id": "comp-chunker", "name": "Document Chunker & Parsing Pipeline", "type": "Worker", "layer": "Async Ingestion", "tech": "Async Celery Worker + Unstructured", "responsibilities": ["Deterministic sentence splitting", "Token length normalization", "Embedding batching queue"], "data_flow_in": ["Raw file streams"], "data_flow_out": ["Normalized text chunks"]},
            {"id": "comp-llm", "name": "LLM Synthesis & Citation Engine", "type": "AI Service", "layer": "Domain Intelligence", "tech": "OpenAI / Anthropic SDK + Prompt Chainer", "responsibilities": ["Cited factual answer synthesis", "Hallucination guardrail evaluation", "Confidence scoring"], "data_flow_in": ["Top-K retrieved context chunks"], "data_flow_out": ["Cited answers"]},
            {"id": "comp-vector", "name": "pgvector Vector Embedding Index", "type": "Storage", "layer": "Vector Storage", "tech": "PostgreSQL 16 + pgvector HNSW", "responsibilities": ["High-dimensional 1536-dim vector indexing", "Sub-50ms cosine similarity search", "Approximate Nearest Neighbor (ANN)"], "data_flow_in": ["Query embedding vectors"], "data_flow_out": ["Ranked top-k text chunks"]},
            {"id": "comp-db", "name": "Metadata & Query Log Store", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16 Relational", "responsibilities": ["Document metadata persistence", "User query audit logging", "Tenant access scopes"], "data_flow_in": ["SQL Queries"], "data_flow_out": ["Document recordsets"]},
            {"id": "comp-s3", "name": "Raw Document Object Lake", "type": "Storage", "layer": "Object Storage", "tech": "S3-Compatible Object Store", "responsibilities": ["Immutable original PDF / DOCX storage", "Presigned download links", "Document versioning"], "data_flow_in": ["Raw file uploads"], "data_flow_out": ["File byte streams"]},
            {"id": "comp-infra", "name": "Docker & GPU Inference Hub", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose + Multi-stage Builds", "responsibilities": ["Containerized workers", "Zero-downtime health probing", "GPU/CPU inference scaling"], "data_flow_in": ["Health probes"], "data_flow_out": ["Telemetry streams"]}
        ]

        nodes = [
            {"id": "node-search", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": "Semantic Search SPA", "category": "Frontend", "tech": "React + Tailwind", "description": "Interactive AI query & citation UI"}},
            {"id": "node-admin", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Ingestion Studio", "category": "Frontend", "tech": "React + Monaco", "description": "Document upload & chunk visualizer"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "RAG Orchestration Gateway", "category": "Gateway", "tech": "FastAPI + Pydantic", "description": "Prompt routing & context assembler"}},
            {"id": "node-chunker", "type": "customNode", "position": {"x": 640, "y": 60}, "data": {"label": "Document Chunker Pipeline", "category": "Worker", "tech": "Celery Worker", "description": "Semantic splitting & embedding queue"}},
            {"id": "node-llm", "type": "customNode", "position": {"x": 640, "y": 240}, "data": {"label": "LLM Synthesis Engine", "category": "AI Service", "tech": "OpenAI / Anthropic", "description": "Cited answer synthesis & guardrails"}},
            {"id": "node-vector", "type": "customNode", "position": {"x": 960, "y": 60}, "data": {"label": "pgvector Embedding Store", "category": "Storage", "tech": "pgvector (HNSW Index)", "description": "Sub-50ms cosine similarity retrieval"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 200}, "data": {"label": "Metadata & Query DB", "category": "Database", "tech": "PostgreSQL 16", "description": "Document records & search history"}},
            {"id": "node-s3", "type": "customNode", "position": {"x": 960, "y": 340}, "data": {"label": "Raw Document Lake", "category": "Storage", "tech": "S3 Object Store", "description": "Original PDFs & immutable files"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "Docker Inference Hub", "category": "Deployment", "tech": "Docker Compose", "description": "Container runtime & worker autoscaling"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-search", "target": "node-gateway", "label": "HTTPS / Semantic Query", "animated": True},
            {"id": "e-2", "source": "node-admin", "target": "node-gateway", "label": "Document Uploads", "animated": True},
            {"id": "e-3", "source": "node-gateway", "target": "node-chunker", "label": "Ingestion Queue", "animated": True},
            {"id": "e-4", "source": "node-chunker", "target": "node-s3", "label": "Store Raw PDF", "animated": True},
            {"id": "e-5", "source": "node-chunker", "target": "node-vector", "label": "Store Embeddings", "animated": True},
            {"id": "e-6", "source": "node-gateway", "target": "node-vector", "label": "Vector Cosine Search", "animated": True},
            {"id": "e-7", "source": "node-gateway", "target": "node-llm", "label": "Context Prompt Synthesis", "animated": True},
            {"id": "e-8", "source": "node-gateway", "target": "node-db", "label": "Log Query & Citation", "animated": True},
            {"id": "e-9", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-10", "source": "node-infra", "target": "node-db", "label": "Persistent Volumes", "animated": False}
        ]

        data_flows = [
            {"from_component": "AI Search & Citation Explorer SPA", "to_component": "RAG Orchestration Gateway", "protocol": "HTTPS / JSON", "payload": "JWT Bearer, Query Text", "description": "User semantic queries"},
            {"from_component": "RAG Orchestration Gateway", "to_component": "pgvector Vector Embedding Index", "protocol": "Vector RPC", "payload": "Query embedding 1536-dim", "description": "Cosine similarity query"},
            {"from_component": "RAG Orchestration Gateway", "to_component": "LLM Synthesis & Citation Engine", "protocol": "LLM API / JSON", "payload": "Assembled Context & System Prompt", "description": "Answer generation"},
            {"from_component": "Document Chunker & Parsing Pipeline", "to_component": "Raw Document Object Lake", "protocol": "S3 API", "payload": "Binary PDF/DOCX Streams", "description": "Raw file storage"},
            {"from_component": "RAG Orchestration Gateway", "to_component": "Metadata & Query Log Store", "protocol": "PostgreSQL Wire", "payload": "SQL Chunk Reads & Logs", "description": "Chunk hydration & history"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-search", "label": "Search SPA", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-admin", "label": "Ingestion Studio", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "RAG Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-chunker", "label": "Chunker Worker", "category": "Worker", "position": [1.0, 1.5, 0], "color": "#F59E0B"},
            {"id": "3d-llm", "label": "LLM Engine", "category": "AI Service", "position": [1.0, -0.5, 0], "color": "#38BDF8"},
            {"id": "3d-vector", "label": "pgvector Store", "category": "Storage", "position": [3.8, 1.5, 0], "color": "#A855F7"},
            {"id": "3d-db", "label": "Metadata DB", "category": "Database", "position": [3.8, 0, 0], "color": "#EC4899"},
            {"id": "3d-s3", "label": "S3 Object Lake", "category": "Storage", "position": [3.8, -1.5, 0], "color": "#A855F7"},
            {"id": "3d-docker", "label": "Docker Cluster", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = """-- Auto-Generated PostgreSQL Schema for AI / RAG Domain
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(30) DEFAULT 'pdf',
    total_chunks INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'indexed',
    content_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    token_count INTEGER DEFAULT 128,
    embedding_dim INTEGER DEFAULT 1536,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE semantic_query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    generated_answer TEXT NOT NULL,
    top_similarity_score NUMERIC(5,4) DEFAULT 0.8920,
    latency_ms INTEGER DEFAULT 120,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_docs_user_id ON knowledge_documents(user_id);
CREATE INDEX idx_chunks_doc_id ON document_chunks(document_id);
CREATE INDEX idx_queries_user ON semantic_query_logs(user_id);
"""

        functional_reqs = [
            {"id": "FR-01", "title": "Multi-Format Document Ingestion & Parsing", "description": "Upload and extract clean text from PDF, DOCX, MD, and plain text files with metadata extraction.", "priority": "High", "category": "Ingestion"},
            {"id": "FR-02", "title": "Deterministic Chunking & Token Boundary Alignment", "description": "Partition documents into overlapping semantic chunks with sentence boundary preservation.", "priority": "High", "category": "Chunking"},
            {"id": "FR-03", "title": "Vector Similarity Search & Cosine Scoring", "description": "Generate high-dimensional vector embeddings and query pgvector for sub-50ms semantic nearest neighbor retrieval.", "priority": "High", "category": "Vector Search"},
            {"id": "FR-04", "title": "Contextual LLM Answer Synthesis with Citations", "description": "Construct prompt contexts with top-ranked chunks and synthesize natural answers highlighting exact source document references.", "priority": "High", "category": "Synthesis"},
            {"id": "FR-05", "title": "Workspace Access Scope & Audit Trail", "description": "Isolate vector knowledge bases by tenant team and record query audit metrics.", "priority": "Medium", "category": "Governance"}
        ]

        return {
            "domain": "ai_knowledge",
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": "KnowledgeDocument",
            "secondary_entity": "SemanticQueryLog"
        }

    # -------------------------------------------------------------------------
    # 4. E-COMMERCE PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_ecommerce_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        entities = [
            {
                "name": "Product",
                "table_name": "products",
                "description": "Store inventory catalog, pricing, SKU codes, and stock levels",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Product ID"},
                    {"name": "sku", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Inventory SKU code"},
                    {"name": "title", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Product name"},
                    {"name": "category", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'Electronics'", "description": "Category name"},
                    {"name": "price", "type": "NUMERIC(10,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0.00", "description": "Retail price"},
                    {"name": "stock_quantity", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "100", "description": "Available inventory"},
                    {"name": "is_published", "type": "BOOLEAN", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "true", "description": "Storefront visibility"}
                ],
                "indexes": ["idx_products_sku", "idx_products_category"],
                "relations": [{"target_entity": "OrderItem", "type": "one-to-many", "foreign_key": "product_id", "on_delete": "RESTRICT"}]
            },
            {
                "name": "Order",
                "table_name": "orders",
                "description": "Customer purchase orders, checkout statuses, and shipping addresses",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Order ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Customer ID"},
                    {"name": "order_number", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Order tracking code"},
                    {"name": "total_amount", "type": "NUMERIC(10,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0.00", "description": "Final billed total"},
                    {"name": "payment_status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'paid'", "description": "pending, paid, refunded"},
                    {"name": "fulfillment_status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'processing'", "description": "processing, shipped, delivered"},
                    {"name": "shipping_address", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Delivery address"}
                ],
                "indexes": ["idx_orders_user", "idx_orders_number"],
                "relations": [{"target_entity": "OrderItem", "type": "one-to-many", "foreign_key": "order_id", "on_delete": "CASCADE"}]
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Customer registration", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string", "full_name": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "Customer login", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": "Products", "method": "GET", "path": "/api/products", "summary": "Browse catalog with filters", "auth_required": False, "required_role": "public", "query_params": [{"name": "category", "type": "string", "required": False}], "response_success_schema": [{"id": "uuid", "title": "string", "price": "number", "stock_quantity": "integer"}]},
            {"tag": "Products", "method": "POST", "path": "/api/products", "summary": "Add catalog product", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"sku": "string", "title": "string", "category": "string", "price": "number", "stock_quantity": "integer"}, "response_success_schema": {"id": "uuid", "title": "string"}},
            {"tag": "Orders", "method": "GET", "path": "/api/orders", "summary": "List customer orders", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "order_number": "string", "total_amount": "number", "fulfillment_status": "string"}]},
            {"tag": "Orders", "method": "POST", "path": "/api/orders", "summary": "Checkout cart and generate order", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"total_amount": "number", "shipping_address": "string"}, "response_success_schema": {"id": "uuid", "order_number": "string", "payment_status": "string"}}
        ]

        components = [
            {"id": "comp-buyer", "name": "Storefront Buyer Discovery SPA", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + TypeScript + Tailwind", "responsibilities": ["Product discovery & filtering", "Shopping cart state management", "Checkout & payment interface"], "data_flow_in": ["User clicks", "Catalog payloads"], "data_flow_out": ["REST API requests"]},
            {"id": "comp-vendor", "name": "Merchant & Inventory Portal", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Vite", "responsibilities": ["Catalog management & SKU updates", "Order fulfillment tracking", "Revenue & sales telemetry"], "data_flow_in": ["Sales analytics"], "data_flow_out": ["Inventory mutations"]},
            {"id": "comp-gateway", "name": "Cloudflare CDN & API Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + Reverse Proxy", "responsibilities": ["Edge caching & asset compression", "JWT authentication & customer rate limiting", "Microservice path routing"], "data_flow_in": ["REST HTTP/S requests"], "data_flow_out": ["Service requests"]},
            {"id": "comp-catalog", "name": "Catalog & Inventory Service", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + Pydantic v2", "responsibilities": ["Real-time SKU availability checks", "Category hierarchy filtering", "Atomic stock reservations"], "data_flow_in": ["Product queries"], "data_flow_out": ["SQLAlchemy DB queries"]},
            {"id": "comp-order", "name": "Cart & Stripe Checkout Engine", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + Stripe SDK", "responsibilities": ["Tax and discount calculations", "Payment intent generation", "Idempotent order creation"], "data_flow_in": ["Checkout requests"], "data_flow_out": ["Order events"]},
            {"id": "comp-worker", "name": "Async Fulfillment & Invoice Worker", "type": "Worker", "layer": "Async Processing", "tech": "Celery / Redis Queue", "responsibilities": ["Stock decrement confirmation", "Shipping label generation", "Customer email notification dispatch"], "data_flow_in": ["Order Placed Events"], "data_flow_out": ["Fulfillment status updates"]},
            {"id": "comp-db", "name": "PostgreSQL 16 Transactional Store", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16", "responsibilities": ["ACID inventory locks", "Order history persistence", "Product catalog records"], "data_flow_in": ["SQL Queries"], "data_flow_out": ["Recordsets"]},
            {"id": "comp-cache", "name": "Redis Session & Inventory Cache", "type": "Cache", "layer": "Caching & Queues", "tech": "Redis 7.2", "responsibilities": ["Sub-millisecond active cart state", "Hot product catalog caching", "Rate limiting counters"], "data_flow_in": ["Cache reads/writes"], "data_flow_out": ["Cached catalog"]},
            {"id": "comp-infra", "name": "Docker Container Hub", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose", "responsibilities": ["Multi-container orchestration", "High throughput routing", "Volume storage mounts"], "data_flow_in": ["Probes"], "data_flow_out": ["Logs"]}
        ]

        nodes = [
            {"id": "node-buyer", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": "Storefront Buyer SPA", "category": "Frontend", "tech": "React + TypeScript", "description": "Interactive catalog & cart checkout"}},
            {"id": "node-vendor", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Vendor Admin Portal", "category": "Frontend", "tech": "React + Vite", "description": "SKU catalog & sales telemetry"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "Edge CDN & API Gateway", "category": "Gateway", "tech": "FastAPI + Reverse Proxy", "description": "SSL termination & request routing"}},
            {"id": "node-catalog", "type": "customNode", "position": {"x": 640, "y": 60}, "data": {"label": "Catalog & Inventory Core", "category": "Backend", "tech": "FastAPI + Pydantic", "description": "SKU tracking & price calculations"}},
            {"id": "node-order", "type": "customNode", "position": {"x": 640, "y": 200}, "data": {"label": "Cart & Checkout Engine", "category": "Backend", "tech": "FastAPI + Stripe SDK", "description": "Payment intents & order generation"}},
            {"id": "node-worker", "type": "customNode", "position": {"x": 640, "y": 340}, "data": {"label": "Fulfillment & Label Worker", "category": "Worker", "tech": "Celery / Redis Worker", "description": "Shipping labels & email notifications"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 80}, "data": {"label": "PostgreSQL Store", "category": "Database", "tech": "PostgreSQL 16", "description": "Transactional products & orders"}},
            {"id": "node-cache", "type": "customNode", "position": {"x": 960, "y": 260}, "data": {"label": "Redis Stock & Session Cache", "category": "Cache", "tech": "Redis 7.2", "description": "Sub-millisecond stock cache & carts"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "Docker Cluster", "category": "Deployment", "tech": "Docker Compose", "description": "Container network & persistent volumes"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-buyer", "target": "node-gateway", "label": "HTTPS / JSON", "animated": True},
            {"id": "e-2", "source": "node-vendor", "target": "node-gateway", "label": "HTTPS / Admin JWT", "animated": True},
            {"id": "e-3", "source": "node-gateway", "target": "node-catalog", "label": "Catalog Requests", "animated": True},
            {"id": "e-4", "source": "node-gateway", "target": "node-order", "label": "Checkout Actions", "animated": True},
            {"id": "e-5", "source": "node-order", "target": "node-worker", "label": "Order Placed Event", "animated": True},
            {"id": "e-6", "source": "node-catalog", "target": "node-cache", "label": "Cache Reads", "animated": True},
            {"id": "e-7", "source": "node-catalog", "target": "node-db", "label": "Transactional SQL", "animated": True},
            {"id": "e-8", "source": "node-order", "target": "node-db", "label": "Order Writes", "animated": True},
            {"id": "e-9", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-10", "source": "node-infra", "target": "node-db", "label": "Volume Storage", "animated": False}
        ]

        data_flows = [
            {"from_component": "Storefront Buyer Discovery SPA", "to_component": "Cloudflare CDN & API Gateway", "protocol": "HTTPS / JSON", "payload": "Cart DTO, JWT Token", "description": "Checkout transactions"},
            {"from_component": "Cloudflare CDN & API Gateway", "to_component": "Cart & Stripe Checkout Engine", "protocol": "Internal HTTP", "payload": "Checkout Payload", "description": "Order placement"},
            {"from_component": "Cart & Stripe Checkout Engine", "to_component": "Async Fulfillment & Invoice Worker", "protocol": "Event Queue", "payload": "Order Placed Event", "description": "Async fulfillment"},
            {"from_component": "Catalog & Inventory Service", "to_component": "PostgreSQL 16 Transactional Store", "protocol": "PostgreSQL Wire", "payload": "SQL Statements", "description": "Product catalog queries"},
            {"from_component": "Catalog & Inventory Service", "to_component": "Redis Session & Inventory Cache", "protocol": "Redis Wire", "payload": "Cached Product DTO", "description": "Sub-millisecond retrieval"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-buyer", "label": "Buyer SPA", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-vendor", "label": "Vendor Portal", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "API Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-catalog", "label": "Catalog Core", "category": "Backend", "position": [1.0, 1.5, 0], "color": "#84CC16"},
            {"id": "3d-order", "label": "Checkout Engine", "category": "Backend", "position": [1.0, 0, 0], "color": "#84CC16"},
            {"id": "3d-worker", "label": "Fulfillment Worker", "category": "Worker", "position": [1.0, -1.5, 0], "color": "#F59E0B"},
            {"id": "3d-db", "label": "Postgres DB", "category": "Database", "position": [3.8, 0.8, 0], "color": "#EC4899"},
            {"id": "3d-cache", "label": "Redis Cache", "category": "Cache", "position": [3.8, -0.8, 0], "color": "#F43F5E"},
            {"id": "3d-docker", "label": "Docker Infra", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = """-- Auto-Generated PostgreSQL Schema for E-Commerce Domain
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Electronics',
    price NUMERIC(10,2) DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 100,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    payment_status VARCHAR(30) DEFAULT 'paid',
    fulfillment_status VARCHAR(30) DEFAULT 'processing',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
"""

        functional_reqs = [
            {"id": "FR-01", "title": "Catalog & Real-Time Inventory Control", "description": "Manage products, SKU classifications, price tiers, and stock decrement triggers.", "priority": "High", "category": "Catalog"},
            {"id": "FR-02", "title": "Secure Cart & Checkout Gateway", "description": "Customer multi-item cart management with tax and total calculation.", "priority": "High", "category": "Orders"},
            {"id": "FR-03", "title": "Automated Order Processing & Invoicing", "description": "Generate unique tracking numbers and trigger automated fulfillment receipts.", "priority": "High", "category": "Fulfillment"},
            {"id": "FR-04", "title": "Customer Order History & Shipment Tracking", "description": "Provide real-time status updates (processing, dispatched, delivered).", "priority": "Medium", "category": "Tracking"}
        ]

        return {
            "domain": "ecommerce",
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": "Product",
            "secondary_entity": "Order"
        }

    # -------------------------------------------------------------------------
    # 5. LOGISTICS & FLEET PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_logistics_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        sanitized_name = name.strip() or "LogiTrack"
        entities = [
            {
                "name": "Shipment",
                "table_name": "shipments",
                "description": "Logistics cargo parcels, waybills, and delivery milestones",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Shipment ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Shipper user ID"},
                    {"name": "tracking_number", "type": "VARCHAR(60)", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Unique waybill number"},
                    {"name": "origin_address", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Pickup depot"},
                    {"name": "destination_address", "type": "TEXT", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Delivery destination"},
                    {"name": "status", "type": "VARCHAR(40)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'in_transit'", "description": "pending, in_transit, out_for_delivery, delivered"},
                    {"name": "weight_kg", "type": "NUMERIC(8,2)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "5.00", "description": "Package weight"}
                ],
                "indexes": ["idx_shipments_tracking", "idx_shipments_status"],
                "relations": [{"target_entity": "FleetVehicle", "type": "many-to-one", "foreign_key": "vehicle_id", "on_delete": "SET NULL"}]
            },
            {
                "name": "FleetVehicle",
                "table_name": "fleet_vehicles",
                "description": "Transport trucks, vans, and real-time GPS telemetry locations",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Vehicle ID"},
                    {"name": "vin_number", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": True, "default": None, "description": "Vehicle VIN"},
                    {"name": "driver_name", "type": "VARCHAR(100)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Assigned driver"},
                    {"name": "current_latitude", "type": "NUMERIC(10,6)", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "37.7749", "description": "GPS Latitude"},
                    {"name": "current_longitude", "type": "NUMERIC(10,6)", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "-122.4194", "description": "GPS Longitude"},
                    {"name": "is_active", "type": "BOOLEAN", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "true", "description": "Active in fleet"}
                ],
                "indexes": ["idx_vehicles_vin"],
                "relations": []
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Register fleet operator", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "Fleet manager login", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": "Shipments", "method": "GET", "path": "/api/shipments", "summary": "Query active shipments", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "tracking_number": "string", "status": "string"}]},
            {"tag": "Shipments", "method": "POST", "path": "/api/shipments", "summary": "Dispatch new cargo shipment", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"origin_address": "string", "destination_address": "string", "weight_kg": "number"}, "response_success_schema": {"id": "uuid", "tracking_number": "string"}},
            {"tag": "Vehicles", "method": "GET", "path": "/api/vehicles", "summary": "Fetch live fleet telemetry", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "vin_number": "string", "driver_name": "string", "current_latitude": "number"}]}
        ]

        components = [
            {"id": "comp-driver", "name": "Driver Mobile Manifest PWA", "type": "Frontend", "layer": "Presentation", "tech": "React PWA + Geolocation API", "responsibilities": ["Turn-by-turn route delivery", "Proof-of-delivery signature capture", "Offline sync"], "data_flow_in": ["Assigned manifests"], "data_flow_out": ["GPS coordinates"]},
            {"id": "comp-dispatch", "name": "Fleet Dispatch & Control Hub", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + MapLibre GL", "responsibilities": ["Live vehicle map visualizer", "Geofence violation alerts", "Depot assignment control"], "data_flow_in": ["Telemetry stream"], "data_flow_out": ["Dispatch triggers"]},
            {"id": "comp-gateway", "name": "IoT Telemetry & Ingestion Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + WebSocket Hub", "responsibilities": ["High-frequency GPS ingestion", "Driver auth & role checking", "Depot API routing"], "data_flow_in": ["MQTT / REST packets"], "data_flow_out": ["Internal dispatch"]},
            {"id": "comp-routing", "name": "Route Optimization Engine", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + Spatial Routing", "responsibilities": ["Dynamic TSP multi-stop optimization", "Traffic delay re-routing", "Fuel consumption estimation"], "data_flow_in": ["Waypoint arrays"], "data_flow_out": ["Optimized route sequences"]},
            {"id": "comp-tracking", "name": "Live Geolocation & Geofence Worker", "type": "Worker", "layer": "Async Processing", "tech": "Celery / Redis PubSub Worker", "responsibilities": ["Geofence entry/exit detection", "ETA calculation updates", "Customer delivery alerts"], "data_flow_in": ["GPS pings"], "data_flow_out": ["Milestone notifications"]},
            {"id": "comp-db", "name": "PostgreSQL Fleet & Order Store", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16 + PostGIS", "responsibilities": ["Spatial polygon geofences", "Shipment lifecycle integrity", "Fleet vehicle records"], "data_flow_in": ["SQL Queries"], "data_flow_out": ["Recordsets"]},
            {"id": "comp-cache", "name": "Redis Real-Time PubSub & Geo Index", "type": "Cache", "layer": "Caching & Queues", "tech": "Redis 7.2 (GEO Commands)", "responsibilities": ["Sub-second vehicle coordinate broadcasting", "Nearest vehicle queries", "Driver active socket sessions"], "data_flow_in": ["GEO pings"], "data_flow_out": ["Spatial cache hits"]},
            {"id": "comp-lake", "name": "TimescaleDB IoT Telemetry Lake", "type": "Storage", "layer": "Time-Series Storage", "tech": "TimescaleDB / Hypertable", "responsibilities": ["Raw IoT sensor time-series data", "Odometer & speed logs", "Historical route replay"], "data_flow_in": ["Telemetry stream"], "data_flow_out": ["Time-series analytics"]},
            {"id": "comp-infra", "name": "Docker Edge Orchestration", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose", "responsibilities": ["Multi-container edge deployment", "Zero-downtime queue workers", "Volume storage"], "data_flow_in": ["Health signals"], "data_flow_out": ["Logs"]}
        ]

        nodes = [
            {"id": "node-driver", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": "Driver Mobile PWA", "category": "Frontend", "tech": "React PWA + GPS", "description": "Turn-by-turn delivery manifest & e-sign"}},
            {"id": "node-dispatch", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Fleet Operations Hub", "category": "Frontend", "tech": "React + MapLibre", "description": "Live GPS vehicle tracking & geofences"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "IoT Telemetry Gateway", "category": "Gateway", "tech": "FastAPI + WebSockets", "description": "High-frequency GPS & sensor ingestion"}},
            {"id": "node-routing", "type": "customNode", "position": {"x": 640, "y": 60}, "data": {"label": "Route Optimizer Core", "category": "Backend", "tech": "FastAPI + Spatial", "description": "Dynamic TSP multi-stop routing"}},
            {"id": "node-tracking", "type": "customNode", "position": {"x": 640, "y": 240}, "data": {"label": "Live Geofence Worker", "category": "Worker", "tech": "Celery / Redis Worker", "description": "ETA calculation & depot alerts"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 60}, "data": {"label": "PostgreSQL Fleet Store", "category": "Database", "tech": "PostgreSQL 16 + PostGIS", "description": "Shipment records & spatial polygons"}},
            {"id": "node-cache", "type": "customNode", "position": {"x": 960, "y": 200}, "data": {"label": "Redis Geo PubSub", "category": "Cache", "tech": "Redis 7.2 GEO", "description": "Live coordinate broadcasting & socket hub"}},
            {"id": "node-lake", "type": "customNode", "position": {"x": 960, "y": 340}, "data": {"label": "TimescaleDB Telemetry", "category": "Storage", "tech": "TimescaleDB", "description": "High-density IoT GPS sensor lake"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "Docker Edge Hub", "category": "Deployment", "tech": "Docker Compose", "description": "Multi-container high-concurrency runtime"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-driver", "target": "node-gateway", "label": "GPS Pings (MQTT)", "animated": True},
            {"id": "e-2", "source": "node-dispatch", "target": "node-gateway", "label": "HTTPS / Dispatch Commands", "animated": True},
            {"id": "e-3", "source": "node-gateway", "target": "node-routing", "label": "Route Calculations", "animated": True},
            {"id": "e-4", "source": "node-gateway", "target": "node-tracking", "label": "Geofence Checks", "animated": True},
            {"id": "e-5", "source": "node-tracking", "target": "node-cache", "label": "Publish Live Geo", "animated": True},
            {"id": "e-6", "source": "node-routing", "target": "node-db", "label": "Shipment SQL Operations", "animated": True},
            {"id": "e-7", "source": "node-gateway", "target": "node-lake", "label": "Append Sensor Stream", "animated": True},
            {"id": "e-8", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-9", "source": "node-infra", "target": "node-db", "label": "Storage Volumes", "animated": False}
        ]

        data_flows = [
            {"from_component": "Driver Mobile Manifest PWA", "to_component": "IoT Telemetry & Ingestion Gateway", "protocol": "MQTT / WebSockets", "payload": "GPS Coordinates, Speed, Fuel", "description": "Live driver telemetry"},
            {"from_component": "IoT Telemetry & Ingestion Gateway", "to_component": "Route Optimization Engine", "protocol": "Internal RPC", "payload": "Stop Coordinates Array", "description": "TSP Route optimization"},
            {"from_component": "Route Optimization Engine", "to_component": "PostgreSQL Fleet & Order Store", "protocol": "PostgreSQL Wire", "payload": "SQL Spatial Queries", "description": "Waybill records persistence"},
            {"from_component": "Live Geolocation & Geofence Worker", "to_component": "Redis Real-Time PubSub & Geo Index", "protocol": "Redis Wire", "payload": "GEOADD & PUBLISH", "description": "Real-time dispatch broadcasting"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-driver", "label": "Driver PWA", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-dispatch", "label": "Fleet Hub", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "IoT Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-routing", "label": "Route Engine", "category": "Backend", "position": [1.0, 1.5, 0], "color": "#84CC16"},
            {"id": "3d-tracking", "label": "Geofence Worker", "category": "Worker", "position": [1.0, -0.5, 0], "color": "#F59E0B"},
            {"id": "3d-db", "label": "Fleet DB", "category": "Database", "position": [3.8, 1.5, 0], "color": "#EC4899"},
            {"id": "3d-cache", "label": "Redis Geo", "category": "Cache", "position": [3.8, 0, 0], "color": "#F43F5E"},
            {"id": "3d-lake", "label": "Timescale Lake", "category": "Storage", "position": [3.8, -1.5, 0], "color": "#A855F7"},
            {"id": "3d-docker", "label": "Docker Infra", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = f"""-- Auto-Generated PostgreSQL Schema for Logistics Domain ({sanitized_name})
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'dispatcher',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fleet_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin_number VARCHAR(50) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    current_latitude NUMERIC(10,6) DEFAULT 37.7749,
    current_longitude NUMERIC(10,6) DEFAULT -122.4194,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
    tracking_number VARCHAR(60) UNIQUE NOT NULL,
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    status VARCHAR(40) DEFAULT 'in_transit',
    weight_kg NUMERIC(8,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
"""

        functional_reqs = [
            {"id": "FR-01", "title": "Waybill Lifecycle & Parcel Tracking", "description": "Issue tracking numbers, record pickup origins, destinations, and status transitions.", "priority": "High", "category": "Shipments"},
            {"id": "FR-02", "title": "Live Fleet Geolocation & Sensor Telemetry", "description": "Ingest high-frequency GPS pings and monitor vehicle latitude/longitude.", "priority": "High", "category": "Fleet"},
            {"id": "FR-03", "title": "Dynamic Multi-Stop Route Optimization", "description": "Compute optimal driver delivery order minimizing fuel consumption.", "priority": "High", "category": "Routing"}
        ]

        return {
            "domain": "logistics",
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": "Shipment",
            "secondary_entity": "FleetVehicle"
        }

    # -------------------------------------------------------------------------
    # 6. EDTECH / LMS PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_edtech_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        sanitized_name = name.strip() or "EduMatrix"
        entities = [
            {
                "name": "Course",
                "table_name": "courses",
                "description": "Curriculum courses, syllabus modules, and lesson content",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Course ID"},
                    {"name": "instructor_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Instructor user ID"},
                    {"name": "title", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Course name"},
                    {"name": "category", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'Computer Science'", "description": "Category"},
                    {"name": "difficulty_level", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'Intermediate'", "description": "Beginner, Intermediate, Advanced"},
                    {"name": "is_published", "type": "BOOLEAN", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "true", "description": "Published status"}
                ],
                "indexes": ["idx_courses_category"],
                "relations": [{"target_entity": "Enrollment", "type": "one-to-many", "foreign_key": "course_id", "on_delete": "CASCADE"}]
            },
            {
                "name": "Enrollment",
                "table_name": "enrollments",
                "description": "Student enrollment records, progress tracking, and final grades",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Enrollment ID"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Student user ID"},
                    {"name": "course_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Enrolled course"},
                    {"name": "progress_percent", "type": "INTEGER", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "0", "description": "Completion progress (0-100)"},
                    {"name": "grade_score", "type": "NUMERIC(5,2)", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "0.00", "description": "Grade score"},
                    {"name": "status", "type": "VARCHAR(30)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'active'", "description": "active, completed, dropped"}
                ],
                "indexes": ["idx_enroll_user_course"],
                "relations": [{"target_entity": "Course", "type": "many-to-one", "foreign_key": "course_id", "on_delete": "CASCADE"}]
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Student/Teacher registration", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "User login", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": "Courses", "method": "GET", "path": "/api/courses", "summary": "List published courses", "auth_required": False, "required_role": "public", "response_success_schema": [{"id": "uuid", "title": "string", "category": "string"}]},
            {"tag": "Courses", "method": "POST", "path": "/api/courses", "summary": "Author new course", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"title": "string", "category": "string", "difficulty_level": "string"}, "response_success_schema": {"id": "uuid", "title": "string"}},
            {"tag": "Enrollments", "method": "GET", "path": "/api/enrollments", "summary": "List student course progress", "auth_required": True, "required_role": "authenticated", "response_success_schema": [{"id": "uuid", "course_id": "uuid", "progress_percent": "integer"}]}
        ]

        components = [
            {"id": "comp-student", "name": "Student Interactive Learning SPA", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Video.js + Monaco", "responsibilities": ["Video lesson streaming", "Interactive in-browser code editor", "Quiz submissions & progress tracker"], "data_flow_in": ["Course materials"], "data_flow_out": ["Quiz answers"]},
            {"id": "comp-instructor", "name": "Instructor Course Studio", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Markdown WYSIWYG", "responsibilities": ["Curriculum syllabus builder", "Assignment rubric authoring", "Student gradebook telemetry"], "data_flow_in": ["Gradebook analytics"], "data_flow_out": ["Course updates"]},
            {"id": "comp-gateway", "name": "EdTech Core API Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + OAuth2", "responsibilities": ["Student & teacher role verification", "Enrollment permissions check", "High throughput API routing"], "data_flow_in": ["REST HTTP/S"], "data_flow_out": ["Microservice calls"]},
            {"id": "comp-courses", "name": "Curriculum & Enrollment Core", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + Pydantic v2", "responsibilities": ["Course module unlocking rules", "Enrollment lifecycle transactions", "Transcript generation"], "data_flow_in": ["Enrollment DTOs"], "data_flow_out": ["SQLAlchemy DB queries"]},
            {"id": "comp-grader", "name": "Automated Code & Quiz Grader", "type": "Worker", "layer": "Async Processing", "tech": "Async Celery Sandbox Worker", "responsibilities": ["Sandboxed code test execution", "Automated quiz grading", "Instant feedback generation"], "data_flow_in": ["Submission payloads"], "data_flow_out": ["Grade results"]},
            {"id": "comp-media", "name": "Video CDN & Adaptive Bitrate Relay", "type": "Media Service", "layer": "Media Streaming", "tech": "HLS / DASH Video Streaming CDN", "responsibilities": ["Adaptive bitrate video transcoding", "Secure presigned video streaming", "Playback analytics"], "data_flow_in": ["Video requests"], "data_flow_out": ["HLS chunks"]},
            {"id": "comp-db", "name": "PostgreSQL Academic Store", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16", "responsibilities": ["Curriculum structure records", "Student grades & submissions", "User profiles"], "data_flow_in": ["SQL statements"], "data_flow_out": ["Recordsets"]},
            {"id": "comp-cache", "name": "Redis Leaderboard & Session Cache", "type": "Cache", "layer": "Caching & Queues", "tech": "Redis 7.2 Sorted Sets", "responsibilities": ["Real-time gamification leaderboard", "Active student session tokens", "Cached course syllabus"], "data_flow_in": ["Score updates"], "data_flow_out": ["Rankings"]},
            {"id": "comp-infra", "name": "Docker Scalable Container Cluster", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose", "responsibilities": ["Container isolation for sandboxed code execution", "Health telemetry", "Volume storage"], "data_flow_in": ["Health checks"], "data_flow_out": ["Logs"]}
        ]

        nodes = [
            {"id": "node-student", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": "Student Learning SPA", "category": "Frontend", "tech": "React + Monaco", "description": "Interactive video lessons & code playground"}},
            {"id": "node-instructor", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Instructor Studio", "category": "Frontend", "tech": "React + WYSIWYG", "description": "Curriculum authoring & gradebook metrics"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "EdTech Core API Gateway", "category": "Gateway", "tech": "FastAPI + OAuth2", "description": "Role verification & syllabus routing"}},
            {"id": "node-courses", "type": "customNode", "position": {"x": 640, "y": 60}, "data": {"label": "Curriculum & Enrollment Core", "category": "Backend", "tech": "FastAPI + Pydantic", "description": "Lesson unlocking & certificate generation"}},
            {"id": "node-grader", "type": "customNode", "position": {"x": 640, "y": 200}, "data": {"label": "Automated Sandbox Grader", "category": "Worker", "tech": "Celery Worker", "description": "Instant code execution & quiz grading"}},
            {"id": "node-media", "type": "customNode", "position": {"x": 640, "y": 340}, "data": {"label": "Video Streaming CDN", "category": "Media Service", "tech": "HLS Video CDN", "description": "Adaptive bitrate video playback"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 80}, "data": {"label": "PostgreSQL Academic DB", "category": "Database", "tech": "PostgreSQL 16", "description": "Course content & student transcripts"}},
            {"id": "node-cache", "type": "customNode", "position": {"x": 960, "y": 260}, "data": {"label": "Redis Leaderboard Cache", "category": "Cache", "tech": "Redis 7.2 (ZSET)", "description": "Real-time rank scoring & active sessions"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "Docker Container Hub", "category": "Deployment", "tech": "Docker Compose", "description": "Sandboxed grading environment & clusters"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-student", "target": "node-gateway", "label": "HTTPS / JSON", "animated": True},
            {"id": "e-2", "source": "node-instructor", "target": "node-gateway", "label": "HTTPS / Teacher JWT", "animated": True},
            {"id": "e-3", "source": "node-student", "target": "node-media", "label": "HLS Video Stream", "animated": True},
            {"id": "e-4", "source": "node-gateway", "target": "node-courses", "label": "Enrollment Actions", "animated": True},
            {"id": "e-5", "source": "node-gateway", "target": "node-grader", "label": "Submit Code / Quiz", "animated": True},
            {"id": "e-6", "source": "node-grader", "target": "node-cache", "label": "Update Leaderboard", "animated": True},
            {"id": "e-7", "source": "node-courses", "target": "node-db", "label": "Academic SQL", "animated": True},
            {"id": "e-8", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-9", "source": "node-infra", "target": "node-db", "label": "Storage Volumes", "animated": False}
        ]

        data_flows = [
            {"from_component": "Student Interactive Learning SPA", "to_component": "EdTech Core API Gateway", "protocol": "HTTPS / JSON", "payload": "JWT Bearer, Quiz Payload", "description": "Interactive learning actions"},
            {"from_component": "Student Interactive Learning SPA", "to_component": "Video CDN & Adaptive Bitrate Relay", "protocol": "HLS Streaming", "payload": "Encrypted Video Chunks", "description": "Lesson video streaming"},
            {"from_component": "EdTech Core API Gateway", "to_component": "Automated Code & Quiz Grader", "protocol": "Redis Queue", "payload": "Code Execution Job", "description": "Sandboxed evaluation"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-student", "label": "Student SPA", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-instructor", "label": "Instructor Studio", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "Edu Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-courses", "label": "Course Core", "category": "Backend", "position": [1.0, 1.5, 0], "color": "#84CC16"},
            {"id": "3d-grader", "label": "Quiz Grader", "category": "Worker", "position": [1.0, 0, 0], "color": "#F59E0B"},
            {"id": "3d-media", "label": "Video CDN", "category": "Media Service", "position": [1.0, -1.5, 0], "color": "#3B82F6"},
            {"id": "3d-db", "label": "Academic DB", "category": "Database", "position": [3.8, 0.8, 0], "color": "#EC4899"},
            {"id": "3d-cache", "label": "Leaderboard", "category": "Cache", "position": [3.8, -0.8, 0], "color": "#F43F5E"},
            {"id": "3d-docker", "label": "Docker Cluster", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = f"""-- Auto-Generated PostgreSQL Schema for EdTech Domain ({sanitized_name})
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Computer Science',
    difficulty_level VARCHAR(30) DEFAULT 'Intermediate',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    grade_score NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enroll_user_course ON enrollments(user_id, course_id);
"""

        functional_reqs = [
            {"id": "FR-01", "title": "Curriculum & Course Content Builder", "description": "Create courses with module sequences, video embeds, and reading materials.", "priority": "High", "category": "Curriculum"},
            {"id": "FR-02", "title": "Interactive Student Enrollment & Progress Tracking", "description": "Allow students to enroll and track percentage completion across lessons.", "priority": "High", "category": "Enrollment"},
            {"id": "FR-03", "title": "Automated Quiz & Assignment Evaluation", "description": "Evaluate student code submissions and quiz responses with instant score issuance.", "priority": "High", "category": "Grading"}
        ]

        return {
            "domain": "edtech",
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": "Course",
            "secondary_entity": "Enrollment"
        }

    # -------------------------------------------------------------------------
    # 7. DEVOPS & OBSERVABILITY PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_devops_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        return cls._build_enterprise_profile(name, idea, users, prob, feats, stack, domain_tag="devops_saas", entity_name="Incident", secondary_name="MetricProbe")

    # -------------------------------------------------------------------------
    # 8. REAL ESTATE / PROPTECH PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_realestate_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        return cls._build_enterprise_profile(name, idea, users, prob, feats, stack, domain_tag="realestate", entity_name="PropertyListing", secondary_name="LeaseAgreement")

    # -------------------------------------------------------------------------
    # 9. SOCIAL CRM & COMMUNITY PROFILE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_social_profile(cls, name: str, idea: str, users: str, prob: str, feats: List[str], stack: str) -> Dict[str, Any]:
        return cls._build_enterprise_profile(name, idea, users, prob, feats, stack, domain_tag="social_crm", entity_name="CommunityPost", secondary_name="ActivityEvent")

    # -------------------------------------------------------------------------
    # 10. DYNAMIC ENTERPRISE PROFILE (Multi-Tiered Layout)
    # -------------------------------------------------------------------------
    @classmethod
    def _build_enterprise_profile(
        cls,
        name: str,
        idea: str,
        users: str,
        prob: str,
        feats: List[str],
        stack: str,
        domain_tag: str = "enterprise",
        entity_name: str = "ProjectItem",
        secondary_name: str = "ActivityLog",
    ) -> Dict[str, Any]:
        sanitized_name = name.strip() or "Core Service"

        # Determine appropriate entity names from idea/features if available
        words = [w.capitalize() for w in re.findall(r'[A-Za-z]{4,}', idea)]
        domain_entity = words[0] if words else entity_name
        if domain_entity in ["This", "That", "With", "From", "Your", "Have", "User", "Project", "Some", "Many"]:
            domain_entity = entity_name

        table_main = domain_entity.lower() + "s"
        table_sec = secondary_name.lower() + "s"

        entities = [
            {
                "name": domain_entity,
                "table_name": table_main,
                "description": f"Primary managed {domain_entity} records for {sanitized_name}",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Primary unique key"},
                    {"name": "user_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Owner user foreign key"},
                    {"name": "title", "type": "VARCHAR(255)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": f"{domain_entity} title or name"},
                    {"name": "category", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'Standard'", "description": "Classification category"},
                    {"name": "status", "type": "VARCHAR(50)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'active'", "description": "active, completed, archived"},
                    {"name": "priority", "type": "VARCHAR(20)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "'medium'", "description": "low, medium, high, critical"},
                    {"name": "data_payload", "type": "JSONB", "is_primary": False, "is_nullable": True, "is_unique": False, "default": "'{}'", "description": "Structured domain parameters"},
                    {"name": "created_at", "type": "TIMESTAMP WITH TIME ZONE", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "NOW()", "description": "Creation timestamp"},
                    {"name": "updated_at", "type": "TIMESTAMP WITH TIME ZONE", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "NOW()", "description": "Last updated"}
                ],
                "indexes": [f"idx_{table_main}_user", f"idx_{table_main}_status"],
                "relations": [{"target_entity": secondary_name, "type": "one-to-many", "foreign_key": f"{domain_entity.lower()}_id", "on_delete": "CASCADE"}]
            },
            {
                "name": secondary_name,
                "table_name": table_sec,
                "description": f"Audited lifecycle events and interactions for {domain_entity}",
                "fields": [
                    {"name": "id", "type": "UUID", "is_primary": True, "is_nullable": False, "is_unique": True, "default": "gen_random_uuid()", "description": "Event ID"},
                    {"name": f"{domain_entity.lower()}_id", "type": "UUID", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": f"Parent {domain_entity} ID"},
                    {"name": "action", "type": "VARCHAR(100)", "is_primary": False, "is_nullable": False, "is_unique": False, "default": None, "description": "Action executed"},
                    {"name": "notes", "type": "TEXT", "is_primary": False, "is_nullable": True, "is_unique": False, "default": None, "description": "Detailed notes or payload diff"},
                    {"name": "created_at", "type": "TIMESTAMP WITH TIME ZONE", "is_primary": False, "is_nullable": False, "is_unique": False, "default": "NOW()", "description": "Event timestamp"}
                ],
                "indexes": [f"idx_{table_sec}_parent"],
                "relations": [{"target_entity": domain_entity, "type": "many-to-one", "foreign_key": f"{domain_entity.lower()}_id", "on_delete": "CASCADE"}]
            }
        ]

        endpoints = [
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/register", "summary": "Register new account", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "full_name": "string", "password": "string"}, "response_success_schema": {"id": "uuid", "email": "string", "full_name": "string"}},
            {"tag": "Authentication", "method": "POST", "path": "/api/auth/login", "summary": "Authenticate and get JWT", "auth_required": False, "required_role": "public", "request_body_schema": {"email": "string", "password": "string"}, "response_success_schema": {"access_token": "string", "token_type": "bearer"}},
            {"tag": f"{domain_entity} Management", "method": "GET", "path": f"/api/{table_main}", "summary": f"List {domain_entity} records with filtering", "auth_required": True, "required_role": "authenticated", "query_params": [{"name": "status", "type": "string", "required": False}, {"name": "search", "type": "string", "required": False}], "response_success_schema": [{"id": "uuid", "title": "string", "category": "string", "status": "string", "priority": "string"}]},
            {"tag": f"{domain_entity} Management", "method": "POST", "path": f"/api/{table_main}", "summary": f"Create new {domain_entity}", "auth_required": True, "required_role": "authenticated", "request_body_schema": {"title": "string", "category": "string", "status": "string", "priority": "string", "data_payload": "object"}, "response_success_schema": {"id": "uuid", "title": "string", "status": "string"}},
            {"tag": f"{domain_entity} Management", "method": "GET", "path": f"/api/{table_main}/{{id}}", "summary": f"Get {domain_entity} details", "auth_required": True, "required_role": "authenticated", "path_params": [{"name": "id", "type": "uuid", "required": True}], "response_success_schema": {"id": "uuid", "title": "string", "data_payload": "object"}},
            {"tag": f"{domain_entity} Management", "method": "PUT", "path": f"/api/{table_main}/{{id}}", "summary": f"Update {domain_entity} parameters", "auth_required": True, "required_role": "authenticated", "path_params": [{"name": "id", "type": "uuid", "required": True}], "request_body_schema": {"title": "string", "status": "string", "priority": "string"}, "response_success_schema": {"id": "uuid", "title": "string"}},
            {"tag": f"{domain_entity} Management", "method": "DELETE", "path": f"/api/{table_main}/{{id}}", "summary": f"Delete {domain_entity}", "auth_required": True, "required_role": "authenticated", "path_params": [{"name": "id", "type": "uuid", "required": True}], "response_success_schema": {"success": True}}
        ]

        components = [
            {"id": "comp-frontend", "name": f"{sanitized_name} Client Portal", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + TypeScript + Tailwind", "responsibilities": ["Primary user dashboard", "Real-time record filtering", "Visual status telemetry"], "data_flow_in": ["User actions", "API payloads"], "data_flow_out": ["JWT Authenticated REST queries"]},
            {"id": "comp-admin", "name": f"{sanitized_name} Operator & Admin Console", "type": "Frontend", "layer": "Presentation", "tech": "React 18 + Vite", "responsibilities": ["System configuration", "Batch lifecycle updates", "Audit event inspector"], "data_flow_in": ["Audit payloads"], "data_flow_out": ["Administrative commands"]},
            {"id": "comp-gateway", "name": f"{sanitized_name} API Gateway", "type": "Gateway", "layer": "Security & Ingress", "tech": "FastAPI + Pydantic v2", "responsibilities": ["Request authorization & rate limiting", "Data schema validation", "Microservice load balancing"], "data_flow_in": ["REST HTTP/S requests"], "data_flow_out": ["Internal service calls"]},
            {"id": "comp-core", "name": f"{domain_entity} Domain Core Engine", "type": "Backend", "layer": "Application Core", "tech": "FastAPI + SQLAlchemy", "responsibilities": [f"State transition validation for {domain_entity}", "Business constraint validation", "Entity aggregation"], "data_flow_in": ["Validated DTOs"], "data_flow_out": ["SQLAlchemy DB queries"]},
            {"id": "comp-worker", "name": "Async Workflow Automation Worker", "type": "Worker", "layer": "Async Processing", "tech": "Asyncio / Background Task Dispatcher", "responsibilities": ["Asynchronous event dispatch", "Scheduled reporting aggregation", "Webhook alerts"], "data_flow_in": ["Workflow triggers"], "data_flow_out": ["Status notifications"]},
            {"id": "comp-db", "name": "PostgreSQL Relational Store", "type": "Database", "layer": "Persistence", "tech": "PostgreSQL 16 + SQLAlchemy", "responsibilities": ["Relational integrity & constraints", "Indexed query acceleration", "Audit trail logging"], "data_flow_in": ["SQL statements"], "data_flow_out": ["Recordsets"]},
            {"id": "comp-cache", "name": "Redis In-Memory Accelerator", "type": "Cache", "layer": "Caching & Queues", "tech": "Redis 7.2", "responsibilities": ["User session store", "Active record caching", "API rate limiter"], "data_flow_in": ["Cache keys"], "data_flow_out": ["Cached values"]},
            {"id": "comp-storage", "name": "Document & Artifact Lake", "type": "Storage", "layer": "Object Storage", "tech": "S3-Compatible Object Store", "responsibilities": ["Attachment binary storage", "Export report artifacts", "Blob retention"], "data_flow_in": ["Blob streams"], "data_flow_out": ["Signed URLs"]},
            {"id": "comp-infra", "name": "Docker Production Hub", "type": "Deployment", "layer": "Infrastructure", "tech": "Docker Compose", "responsibilities": ["Reproducible container sandbox", "Health monitoring", "Port isolation"], "data_flow_in": ["Health signals"], "data_flow_out": ["Telemetry"]}
        ]

        nodes = [
            {"id": "node-client", "type": "customNode", "position": {"x": 40, "y": 80}, "data": {"label": f"{sanitized_name} Client SPA", "category": "Frontend", "tech": "React + TypeScript", "description": "Interactive domain console"}},
            {"id": "node-admin", "type": "customNode", "position": {"x": 40, "y": 300}, "data": {"label": "Operator Admin Console", "category": "Frontend", "tech": "React + Vite", "description": "System config & batch operations"}},
            {"id": "node-gateway", "type": "customNode", "position": {"x": 340, "y": 180}, "data": {"label": "Enterprise API Gateway", "category": "Gateway", "tech": "FastAPI + Pydantic", "description": "JWT auth & request routing"}},
            {"id": "node-core", "type": "customNode", "position": {"x": 640, "y": 80}, "data": {"label": f"{domain_entity} Core Engine", "category": "Backend", "tech": "FastAPI + SQLAlchemy", "description": "Domain rules & state transitions"}},
            {"id": "node-worker", "type": "customNode", "position": {"x": 640, "y": 280}, "data": {"label": "Async Automation Worker", "category": "Worker", "tech": "Async Worker Service", "description": "Event queue & notifications"}},
            {"id": "node-db", "type": "customNode", "position": {"x": 960, "y": 60}, "data": {"label": "PostgreSQL Store", "category": "Database", "tech": "PostgreSQL 16", "description": "Relational transactional database"}},
            {"id": "node-cache", "type": "customNode", "position": {"x": 960, "y": 200}, "data": {"label": "Redis Accelerator", "category": "Cache", "tech": "Redis 7.2", "description": "Fast caching & rate limiting"}},
            {"id": "node-storage", "type": "customNode", "position": {"x": 960, "y": 340}, "data": {"label": "Document Object Lake", "category": "Storage", "tech": "S3 Object Store", "description": "Binary attachments & report artifacts"}},
            {"id": "node-infra", "type": "customNode", "position": {"x": 500, "y": 500}, "data": {"label": "Docker Orchestrator", "category": "Deployment", "tech": "Docker Compose", "description": "Isolated container orchestration"}}
        ]

        edges = [
            {"id": "e-1", "source": "node-client", "target": "node-gateway", "label": "HTTPS / JSON (JWT)", "animated": True},
            {"id": "e-2", "source": "node-admin", "target": "node-gateway", "label": "HTTPS / Admin Token", "animated": True},
            {"id": "e-3", "source": "node-gateway", "target": "node-core", "label": "REST Commands", "animated": True},
            {"id": "e-4", "source": "node-gateway", "target": "node-worker", "label": "Async Tasks", "animated": True},
            {"id": "e-5", "source": "node-core", "target": "node-db", "label": "SQLAlchemy ORM", "animated": True},
            {"id": "e-6", "source": "node-core", "target": "node-cache", "label": "Cache Reads/Writes", "animated": True},
            {"id": "e-7", "source": "node-worker", "target": "node-storage", "label": "Export Artifacts", "animated": True},
            {"id": "e-8", "source": "node-infra", "target": "node-gateway", "label": "Health Probes", "animated": False},
            {"id": "e-9", "source": "node-infra", "target": "node-db", "label": "Volume Mounts", "animated": False}
        ]

        data_flows = [
            {"from_component": f"{sanitized_name} Client Portal", "to_component": f"{sanitized_name} API Gateway", "protocol": "HTTPS / JSON", "payload": "JWT Bearer, Form Data", "description": "User commands"},
            {"from_component": f"{sanitized_name} API Gateway", "to_component": f"{domain_entity} Domain Core Engine", "protocol": "Internal HTTP", "payload": "Validated DTO", "description": "Domain mutations"},
            {"from_component": f"{domain_entity} Domain Core Engine", "to_component": "PostgreSQL Relational Store", "protocol": "PostgreSQL Wire", "payload": "SQL CRUD Statements", "description": "Transactional persistence"},
            {"from_component": f"{sanitized_name} API Gateway", "to_component": "Async Workflow Automation Worker", "protocol": "Async Task", "payload": "Event Context", "description": "Background execution"}
        ]

        spatial_3d_nodes = [
            {"id": "3d-client", "label": "Client Portal", "category": "Frontend", "position": [-4.0, 1.2, 0], "color": "#10B981"},
            {"id": "3d-admin", "label": "Admin Console", "category": "Frontend", "position": [-4.0, -1.2, 0], "color": "#10B981"},
            {"id": "3d-gateway", "label": "Gateway", "category": "Gateway", "position": [-1.5, 0, 0], "color": "#6366F1"},
            {"id": "3d-core", "label": "Domain Core", "category": "Backend", "position": [1.0, 1.5, 0], "color": "#84CC16"},
            {"id": "3d-worker", "label": "Workflow Worker", "category": "Worker", "position": [1.0, -0.5, 0], "color": "#F59E0B"},
            {"id": "3d-db", "label": "PostgreSQL DB", "category": "Database", "position": [3.8, 1.5, 0], "color": "#EC4899"},
            {"id": "3d-cache", "label": "Redis Cache", "category": "Cache", "position": [3.8, 0, 0], "color": "#F43F5E"},
            {"id": "3d-storage", "label": "Artifact Lake", "category": "Storage", "position": [3.8, -1.5, 0], "color": "#A855F7"},
            {"id": "3d-docker", "label": "Docker Cluster", "category": "Deployment", "position": [0, -2.8, 0], "color": "#64748B"}
        ]

        sql_ddl = f"""-- Auto-Generated PostgreSQL Schema for {sanitized_name}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE {table_main} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Standard',
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    data_payload JSONB DEFAULT '{{}}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE {table_sec} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    {domain_entity.lower()}_id UUID NOT NULL REFERENCES {table_main}(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_{table_main}_user ON {table_main}(user_id);
CREATE INDEX idx_{table_main}_status ON {table_main}(status);
"""

        functional_reqs = [
            {"id": "FR-01", "title": f"{domain_entity} Lifecycle & State Management", "description": f"Create, track, and update {domain_entity} entities across all operational states with audit integrity.", "priority": "High", "category": "Core Domain"},
            {"id": "FR-02", "title": "Multi-Parameter Filtering & Search Index", "description": f"Search and filter {domain_entity} records by status, category, priority, and metadata attributes.", "priority": "High", "category": "Search & Index"},
            {"id": "FR-03", "title": "Automated Validation & Workflow Execution", "description": f"Execute domain rules, input parameter constraints, and automated alerts for {sanitized_name}.", "priority": "High", "category": "Automation"},
            {"id": "FR-04", "title": "Interactive Analytics & Metric Dashboard", "description": f"Visualize active {domain_entity} counts, operational metrics, and status distributions.", "priority": "Medium", "category": "Analytics"}
        ]

        return {
            "domain": domain_tag,
            "entities": entities,
            "endpoints": endpoints,
            "components": components,
            "nodes": nodes,
            "edges": edges,
            "data_flows": data_flows,
            "spatial_3d_nodes": spatial_3d_nodes,
            "sql_ddl": sql_ddl,
            "functional_requirements": functional_reqs,
            "primary_entity": domain_entity,
            "secondary_entity": secondary_name
        }
