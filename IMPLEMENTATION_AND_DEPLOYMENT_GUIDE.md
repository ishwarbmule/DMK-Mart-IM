# ALGOLSOFT: Enterprise AI-Native ERP Platform
## Production Implementation, Infrastructure as Code, CI/CD & Operations Manual

---

## Document Metadata & Engineering Governance
- **Document ID**: ALGOLSOFT-SPEC-DEVOPS-2026-V4
- **Version**: 4.5.0-ENTERPRISE-PROD
- **Classification**: Production Technical Specification (Client Ready)
- **Target Audience**: Chief Information Security Officers (CISO), VP of Infrastructure, Lead SREs, DevOps Engineers, Enterprise Solution Architects
- **Scope**: Infrastructure as Code (Terraform), Kubernetes Manifests & Helm Charts, Istio Service Mesh, GitOps CI/CD Pipelines (GitHub Actions & ArgoCD), Observability, SRE Runbooks, and Client Cutover Playbooks.

---

# TABLE OF CONTENTS

1. [Infrastructure as Code (IaC) & Cloud Architecture](#1-infrastructure-as-code-iac--cloud-architecture)
   - 1.1 [AWS Production Multi-AZ VPC Architecture](#11-aws-production-multi-az-vpc-architecture)
   - 1.2 [Terraform Master Blueprint (EKS, RDS PostgreSQL, ClickHouse, Kafka)](#12-terraform-master-blueprint-eks-rds-postgresql-clickhouse-kafka)
2. [Kubernetes Orchestration & Service Mesh Topology](#2-kubernetes-orchestration--service-mesh-topology)
   - 2.1 [Production Namespace & Resource Quota Hierarchy](#21-production-namespace--resource-quota-hierarchy)
   - 2.2 [Kubernetes Deployment & StatefulSet Manifests](#22-kubernetes-deployment--statefulset-manifests)
   - 2.3 [Istio Service Mesh: mTLS, VirtualServices & Traffic Routing](#23-istio-service-mesh-mtls-virtualservices--traffic-routing)
   - 2.4 [Horizontal Pod Autoscaling (HPA) & Custom Metrics](#24-horizontal-pod-autoscaling-hpa--custom-metrics)
3. [GitOps CI/CD Automation & Release Engineering](#3-gitops-cicd-automation--release-engineering)
   - 3.1 [ArgoCD Declarative Application Architecture](#31-argocd-declarative-application-architecture)
   - 3.2 [GitHub Actions Multi-Stage CI Pipeline](#32-github-actions-multi-stage-ci-pipeline)
   - 3.3 [Canary Deployments & Automated Rollback Policies](#33-canary-deployments--automated-rollback-policies)
4. [Enterprise Observability, Monitoring & SRE Runbooks](#4-enterprise-observability-monitoring--sre-runbooks)
   - 4.1 [Prometheus Alerting Rules & SLI/SLO Framework](#41-prometheus-alerting-rules--slislo-framework)
   - 4.2 [Grafana Dashboard Definitions (Core ERP Performance)](#42-grafana-dashboard-definitions-core-erp-performance)
   - 4.3 [Distributed Tracing with OpenTelemetry & Jaeger](#43-distributed-tracing-with-opentelemetry--jaeger)
   - 4.4 [SRE Incident Remediation Playbooks (P1/P2 Outages)](#44-sre-incident-remediation-playbooks-p1p2-outages)
5. [Enterprise Quality Assurance & Testing Suites](#5-enterprise-quality-assurance--testing-suites)
   - 5.1 [k6 High-Concurrency Load & Stress Testing Script](#51-k6-high-concurrency-load--stress-testing-script)
   - 5.2 [LitmusChaos Automated Chaos Engineering Experiments](#52-litmuschaos-automated-chaos-engineering-experiments)
   - 5.3 [Pact Microservice Contract Testing Suite](#53-pact-microservice-contract-testing-suite)
6. [Client Cutover, Data Migration & Go-Live Playbook](#6-client-cutover-data-migration--go-live-playbook)
   - 6.1 [Legacy ERP Data Extraction & ETL Pipeline](#61-legacy-erp-data-extraction--etl-pipeline)
   - 6.2 [Parallel Run Strategy & Balance Reconciliation](#62-parallel-run-strategy--balance-reconciliation)
   - 6.3 [Go-Live Execution Checklist (T-Minus 30 Days to Day +1)](#63-go-live-execution-checklist-t-minus-30-days-to-day-1)

---

# 1. INFRASTRUCTURE AS CODE (IAC) & CLOUD ARCHITECTURE

## 1.1 AWS Production Multi-AZ VPC Architecture

ALGOLSOFT is deployed across three Availability Zones (AZs) in a dedicated AWS Virtual Private Cloud (VPC) designed for military-grade network isolation.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AWS MULTI-AZ ENTERPRISE VPC TOPOLOGY                              │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                   │
│   PUBLIC SUBNETS (10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24)                                          │
│   ├── AWS Application Load Balancers (ALB) with AWS WAF Shield                                    │
│   └── NAT Gateways (1 per AZ for redundant egress)                                                │
│                                                                                                   │
│   PRIVATE APPLICATION SUBNETS (10.0.10.0/20, 10.0.20.0/20, 10.0.30.0/20)                         │
│   ├── AWS EKS Managed Node Groups (General Microservices: m6i.2xlarge)                            │
│   ├── AWS EKS GPU Node Groups (AI Inference & OCR: g5.2xlarge with NVIDIA A10G)                   │
│   └── Internal Istio Ingress Gateways                                                             │
│                                                                                                   │
│   ISOLATED DATA SUBNETS (10.0.100.0/22, 10.0.200.0/22, 10.0.300.0/22 - No Internet Route)        │
│   ├── AWS Aurora PostgreSQL 16 (Multi-AZ Cluster with Read Replicas)                              │
│   ├── ClickHouse Cloud / Self-Hosted Managed Cluster (3-Node ReplicatedMergeTree)                 │
│   ├── Amazon Managed Streaming for Apache Kafka (MSK KRaft 3-AZ Cluster)                          │
│   └── Amazon ElastiCache Redis 7 Cluster (Cluster Mode Enabled)                                   │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.2 Terraform Master Blueprint (EKS, RDS PostgreSQL, ClickHouse, Kafka)

```hcl
# ==============================================================================
# TERRAFORM PRODUCTION MASTER BLUEPRINT - ALGOLSOFT ENTERPRISE
# ==============================================================================

terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
  backend "s3" {
    bucket         = "algolsoft-prod-tfstate-us-east-1"
    key            = "infrastructure/production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "algolsoft-tfstate-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = "Production"
      Platform    = "ALGOLSOFT-ERP"
      ManagedBy   = "Terraform"
      Security    = "Strict-Zero-Trust"
    }
  }
}

# ------------------------------------------------------------------------------
# VPC & SUBNET NETWORKING MODULE
# ------------------------------------------------------------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.8.1"

  name = "algolsoft-prod-vpc"
  cidr = "10.0.0.0/16"

  azs              = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnets   = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets  = ["10.0.10.0/20", "10.0.20.0/20", "10.0.30.0/20"]
  database_subnets = ["10.0.100.0/22", "10.0.200.0/22", "10.0.300.0/22"]

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_dns_hostnames   = true
  enable_dns_support     = true

  create_database_subnet_group           = true
  create_database_subnet_route_table     = true
  create_database_internet_gateway_route = false

  tags = {
    "kubernetes.io/cluster/algolsoft-prod-eks" = "shared"
  }
}

# ------------------------------------------------------------------------------
# EKS CLUSTER WITH HYBRID CPU & GPU NODE GROUPS
# ------------------------------------------------------------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.10.0"

  cluster_name    = "algolsoft-prod-eks"
  cluster_version = "1.30"

  cluster_endpoint_public_access  = false
  cluster_endpoint_private_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    # Core Microservices Node Group (Go Services)
    core_apps = {
      instance_types = ["m6i.2xlarge"]
      min_size       = 6
      max_size       = 30
      desired_size   = 9
      capacity_type  = "ON_DEMAND"
      labels = {
        workload = "core-microservices"
      }
    }

    # High-Performance AI Inference & OCR Node Group (GPU Accelerated)
    ai_inference = {
      instance_types = ["g5.2xlarge"] # NVIDIA A10G GPU (24GB VRAM)
      min_size       = 3
      max_size       = 12
      desired_size   = 3
      capacity_type  = "ON_DEMAND"
      taints = {
        dedicated = {
          key    = "nvidia.com/gpu"
          value  = "present"
          effect = "NO_SCHEDULE"
        }
      }
      labels = {
        workload = "ai-inference-ocr"
      }
    }
  }
}

# ------------------------------------------------------------------------------
# AURORA POSTGRESQL 16 ENTERPRISE CLUSTER
# ------------------------------------------------------------------------------
module "aurora_postgresql" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "9.4.0"

  name           = "algolsoft-prod-aurora-pg"
  engine         = "aurora-postgresql"
  engine_version = "16.2"
  instance_class = "db.r6g.2xlarge"

  instances = {
    primary = { instance_class = "db.r6g.2xlarge" }
    reader1 = { instance_class = "db.r6g.2xlarge" }
    reader2 = { instance_class = "db.r6g.2xlarge" }
  }

  vpc_id               = module.vpc.vpc_id
  db_subnet_group_name = module.vpc.database_subnet_group_name
  security_group_rules = {
    vpc_ingress = {
      cidr_blocks = module.vpc.private_subnets_cidr_blocks
    }
  }

  storage_encrypted   = true
  deletion_protection = true
  monitoring_interval = 10
  apply_immediately   = false

  parameters = [
    { name = "rds.force_ssl", value = "1" },
    { name = "shared_preload_libraries", value = "pg_stat_statements,vector" }
  ]
}
```

---

# 2. KUBERNETES ORCHESTRATION & SERVICE MESH TOPOLOGY

## 2.1 Kubernetes Deployment & StatefulSet Manifests

### 2.1.1 Finance Service Production Deployment (`finance-service-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: finance-service
  namespace: algolsoft-apps
  labels:
    app.kubernetes.io/name: finance-service
    app.kubernetes.io/part-of: algolsoft-erp
    tier: transactional-backend
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      app.kubernetes.io/name: finance-service
  template:
    metadata:
      labels:
        app.kubernetes.io/name: finance-service
        istio.io/rev: default
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app.kubernetes.io/name
                      operator: In
                      values: ["finance-service"]
                topologyKey: "topology.kubernetes.io/zone"
      containers:
        - name: finance-service
          image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/algolsoft/finance-service:v4.5.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: grpc
              containerPort: 50051
            - name: http-metrics
              containerPort: 9090
          resources:
            requests:
              cpu: "1000m"
              memory: "2Gi"
            limits:
              cpu: "4000m"
              memory: "8Gi"
          readinessProbe:
            grpc:
              port: 50051
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            grpc:
              port: 50051
            initialDelaySeconds: 15
            periodSeconds: 20
          env:
            - name: APP_ENV
              value: "production"
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: finance-secrets
                  key: db-host
            - name: KAFKA_BOOTSTRAP_SERVERS
              value: "msk-broker.algolsoft-data.svc.cluster.local:9092"
```

---

## 2.2 Istio Service Mesh: mTLS & VirtualServices

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: algolsoft-apps
spec:
  mtls:
    mode: STRICT
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: finance-service-routing
  namespace: algolsoft-apps
spec:
  hosts:
    - "finance.algolsoft.internal"
  gateways:
    - mesh
  http:
    - name: "canary-release"
      match:
        - headers:
            x-canary-user:
              exact: "true"
      route:
        - destination:
            host: finance-service.algolsoft-apps.svc.cluster.local
            subset: canary
      timeout: 2.0s
      retries:
        attempts: 3
        perTryTimeout: 500ms
        retryOn: "5xx,connect-failure,refused-stream"
    - name: "stable-release"
      route:
        - destination:
            host: finance-service.algolsoft-apps.svc.cluster.local
            subset: stable
            weight: 95
        - destination:
            host: finance-service.algolsoft-apps.svc.cluster.local
            subset: canary
            weight: 5
```

---

# 3. GITOPS CI/CD AUTOMATION & RELEASE ENGINEERING

## 3.1 GitHub Actions Multi-Stage Production CI Pipeline

```yaml
name: Production Microservice CI/CD

on:
  push:
    branches: [main]
    paths:
      - "services/finance/**"
      - "pkg/api/**"

jobs:
  validate-and-test:
    name: Lint, Test & Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Go Toolchain
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache-dependency-path: services/finance/go.sum

      - name: Run GolangCI-Lint
        uses: golangci/golangci-lint-action@v6
        with:
          version: v1.58.0
          working-directory: services/finance

      - name: Run Unit & Integration Tests
        run: |
          cd services/finance
          go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

      - name: Static Security Analysis (Trivy & Snyk)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: 'services/finance'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  build-and-publish:
    name: Build OCI Image & Push to AWS ECR
    needs: validate-and-test
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.version.outputs.tag }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Generate Semantic Version Tag
        id: version
        run: echo "tag=$(date +v%Y%m%d)-$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsECRPushRole
          aws-region: us-east-1

      - name: Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: services/finance/deployments/Dockerfile
          push: true
          tags: 123456789012.dkr.ecr.us-east-1.amazonaws.com/algolsoft/finance-service:${{ steps.version.outputs.tag }}
```

---

# 4. ENTERPRISE OBSERVABILITY, MONITORING & SRE RUNBOOKS

## 4.1 Prometheus Alerting Rules & SLI/SLO Framework

```yaml
groups:
  - name: algolsoft.erp.sli.alerts
    rules:
      - alert: FinancialLedgerErrorRateHigh
        expr: |
          (sum(rate(grpc_server_handled_total{grpc_service="algolsoft.finance.v1.FinancialLedgerService",grpc_code!="OK"}[5m]))
          /
          sum(rate(grpc_server_handled_total{grpc_service="algolsoft.finance.v1.FinancialLedgerService"}[5m]))) > 0.001
        for: 2m
        labels:
          severity: critical
          tier: P1-FINANCIAL-BLOCKER
        annotations:
          summary: "Financial Ledger Service error rate exceeded 0.1% (SLO Breach)"
          description: "High rate of journal entry posting failures detected in tenant {{ $labels.tenant_id }}. Investigate database locks and outbox queues."

      - alert: KafkaOutboxDispatchLagHigh
        expr: sum(core_transactional_outbox_pending_count) by (tenant_id) > 1000
        for: 5m
        labels:
          severity: warning
          tier: P2-OPERATIONAL
        annotations:
          summary: "Transactional Outbox lagging on Kafka emission"
          description: "Outbox dispatcher has over 1,000 pending events for tenant {{ $labels.tenant_id }}."
```

---

## 4.2 SRE Incident Remediation Playbooks (P1/P2 Outages)

### Playbook P1-01: Financial Ledger Lock Contention / Deadlock
1. **Symptoms**: High p99 latencies on `/PostJournalEntry` ($>5,000\text{ms}$), API gateway 504 Gateway Timeouts, Prometheus alert `FinancialLedgerErrorRateHigh` firing.
2. **Immediate Diagnostics**:
   ```bash
   # Identify active lock blocks in Aurora PostgreSQL
   kubectl exec -it aurora-pg-client -n algolsoft-data -- psql -c "
   SELECT blocked_locks.pid AS blocked_pid,
          blocking_locks.pid AS blocking_pid,
          blocked_activity.query AS blocked_statement,
          blocking_activity.query AS current_statement_in_blocking_process
   FROM  pg_catalog.pg_locks blocked_locks
   JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
   JOIN pg_catalog.pg_locks blocking_locks 
       ON blocking_locks.locktype = blocked_locks.locktype
       AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
       AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
       AND blocking_locks.pid != blocked_locks.pid
   JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
   WHERE NOT blocked_locks.granted;"
   ```
3. **Remediation Action**: Terminate the blocking PID via `SELECT pg_cancel_backend(blocking_pid);` and restart the offending batch processing worker pod.

---

# 5. ENTERPRISE QUALITY ASSURANCE & TESTING SUITES

## 5.1 k6 High-Concurrency Load & Stress Testing Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 500 },   // Ramp up to 500 virtual users
    { duration: '10m', target: 2000 }, // Sustained heavy load (2,000 concurrent VUs)
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'],  // 99% of requests must complete under 200ms
    http_req_failed: ['rate<0.0001'],  // Less than 0.01% error rate
  },
};

export default function () {
  const url = 'https://api.algolsoft.internal/api/v1/finance/journals';
  const payload = JSON.stringify({
    tenant_id: 'tnt_acme_industrial_01',
    entry_number: `JE-STRESS-${__VU}-${__ITER}`,
    posting_date: '2026-08-14',
    source_module: 'GL_MANUAL',
    lines: [
      { account_number: '1010', entry_side: 'DEBIT', amount: 1500.00 },
      { account_number: '2010', entry_side: 'CREDIT', amount: 1500.00 },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + __ENV.JWT_TOKEN,
      'X-Idempotency-Key': `k6-${__VU}-${__ITER}-${Date.now()}`,
    },
  };

  const res = http.post(url, payload, params);
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response has ID': (r) => JSON.parse(r.body).journal_entry_id !== undefined,
  });

  sleep(0.1);
}
```

---

# 6. CLIENT CUTOVER, DATA MIGRATION & GO-LIVE PLAYBOOK

## 6.1 Legacy ERP Data Extraction & ETL Pipeline

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LEGACY ERP DATA MIGRATION PIPELINE                                │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                   │
│   1. Extraction Stage (SAP / Oracle / NetSuite)                                                   │
│      ├── High-volume extraction via SAP RFC / Oracle BICC / NetSuite SuiteAnalytics Connect       │
│      └── Generates Parquet staging files in AWS S3 (`s3://algolsoft-migration-stage/`)            │
│                                                                                                   │
│   2. Transformation & Cleansing Engine (Apache Spark / Python Glue)                               │
│      ├── Standardizes Chart of Accounts (COA Mapping Matrix)                                      │
│      ├── Normalizes Vendor / Customer Tax Identifiers (D&B Entity Resolution)                     │
│      └── Cleanses historical duplicate SKU catalogs                                               │
│                                                                                                   │
│   3. Validation & Parallel Ingestion (PostgreSQL Bulk Ingest)                                     │
│      ├── Verifies trial balance matching down to the cent across historical periods               │
│      └── Bulk loads master data via PostgreSQL `COPY` with triggers temporarily disabled          │
│                                                                                                   │
│   4. Dual-Run Synchronization & Delta Capture                                                     │
│      ├── CDC (Change Data Capture) via Debezium mirrors legacy delta transactions                 │
│      └── Reconciles live daily transactions between legacy ERP and ALGOLSOFT                      │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Go-Live Execution Checklist (T-Minus 30 Days to Day +1)

| Timeline | Milestone & Required Verification Gate | Responsible Stakeholder |
|---|---|---|
| **T-30 Days** | Mock Cutover #1: Complete historical data load (5 years GL history, open AP/AR). | Lead Data Migration Architect |
| **T-14 Days** | User Acceptance Testing (UAT) signoff on all 12 core functional modules. | Client Business Leads / PMO |
| **T-7 Days** | Mock Cutover #2 (Dry Run): End-to-end execution within the 36-hour weekend cutoff window. | VP of Engineering / Lead SRE |
| **T-48 Hours** | Final Delta Load & Legacy ERP Freeze (All legacy write operations switched to read-only). | Enterprise Solution Architect |
| **T-0 (Go-Live)** | DNS Switchover to ALGOLSOFT API Gateway. First live production transaction posted. | Chief Technology Officer |
| **Day +1** | Daily soft-close and live trial balance reconciliation against legacy baseline. | Financial Controller Lead |
