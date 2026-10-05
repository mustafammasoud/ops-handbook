---
title: What is Kubernetes?
description: What Kubernetes is and isn't — container orchestration, desired-state management, clusters, reconciliation, and the core mental model.
category: container-orchestration
order: 1
level: beginner
draft: false
tags: [kubernetes]
language: ar
---

## Introduction

**Kubernetes** is an open-source platform for **container orchestration**.

بمعنى أبسط، Kubernetes بيساعدني إني **أشغّل، أدير، وأراقب الـcontainerized applications** على مجموعة من الـmachines بشكل automated.

لما يكون عندي application صغيرة، ممكن أشغّل الـcontainers بتاعتها بشكل مباشر باستخدام Docker أو أي Container Runtime.

لكن لما الـapplication تكبر ويبقى عندي:

* Multiple containers
* Multiple servers
* Multiple application instances
* Network communication between services
* Need for scaling
* Container failures
* Continuous deployments

إدارة كل ده manually بتبدأ تبقى صعبة.

هنا بيظهر دور Kubernetes.

> **Kubernetes automates the deployment, scaling, management, and operation of containerized applications.**

---

## 1. What does "Container Orchestration" mean?

قبل ما أفهم Kubernetes، لازم أفهم معنى **Container Orchestration**.

كلمة *Orchestration* هنا معناها إن فيه system مسؤول عن تنسيق وإدارة مجموعة من الـcontainers بدل ما أتعامل مع كل container بشكل منفصل.

مثلاً عندي application مكونة من:

```mermaid
flowchart TD
    A[My Application] --> B[Frontend Container]
    A --> C[API Container]
    A --> D[Database Container]
```

لو application بسيطة، ممكن أدير الـcontainers دي manually.

لكن لو بقى عندي:

```text
Frontend × 5
API × 10
Worker × 5
Database × 2
```

وكل واحدة موجودة على servers مختلفة، تبدأ تظهر مشاكل كتير:

* مين يشغّل الـcontainers؟
* الـcontainer يتحط على أنهي server؟
* لو container وقع، مين يشغله تاني؟
* لو traffic زاد، أعمل scaling إزاي؟
* إزاي الـservices تلاقي بعضها؟
* إزاي أعمل update بدون downtime؟
* إزاي أعرف حالة الـapplications؟
* إزاي أضمن إن الـdesired number of instances شغال؟

عندنا **Container orchestration** هو المجال اللي بيحل النوع ده من المشاكل.

وKubernetes هو واحد من أشهر platforms المستخدمة لهذا الغرض.

---

## 2. Kubernetes in Simple Terms

ممكن أبسط Kubernetes بالشكل ده:

```mermaid
flowchart TD
    A[Containerized Applications] --> B[Kubernetes]
    B --> C[Deploy]
    B --> D[Scale]
    B --> E[Manage]
    C --> F[Running Applications]
    D --> F
    E --> F
```

بدل ما أقول:

> "شغّل container على server رقم 1."

أقدر أقول لـKubernetes:

> "I want 3 instances of this application running."

وKubernetes يتولى عملية تحقيق الـdesired state دي.

---

## 3. Kubernetes Manages Applications, Not Just Containers

من المهم إني ما أختزلش Kubernetes في إنه:

> "Tool بيشغل Docker containers."

ده تبسيط زيادة.

عندنا Kubernetes بيدير **containerized workloads** من خلال مجموعة من abstractions والـresources.

مثلاً:

```mermaid
flowchart TD
    A[Application] --> B[Kubernetes Resources]
    B --> C[Pods]
    B --> D[Deployments]
    B --> E[Services]
    B --> F[ConfigMaps]
    B --> G[Secrets]
    B --> H[Volumes]
```

الـcontainers نفسها بتشتغل داخل **Pods**، والـPods بتتم إدارتها باستخدام resources مختلفة حسب احتياج الـapplication.

---

## 4. Kubernetes as a Desired-State System

واحدة من أهم الأفكار في Kubernetes هي مفهوم **Desired State**.

بدل ما أدي Kubernetes سلسلة commands أقول له يعملها واحدة واحدة، أنا غالبًا بحدد:

> **What I want the final state to look like.**

مثلاً:

```yaml
replicas: 3
```

ده معناه إن الـdesired state هو:

```text
I want 3 running instances.
```

Kubernetes بيقارن بين:

```mermaid
flowchart TB
    D["Desired State"] --> C["Current State"]

    classDef state fill:#f3eef4,stroke:#9a7fa0,stroke-width:2px,color:#3e3342;

    class D,C state;
```

ولو فيه difference، Kubernetes بيحاول يعمل changes للوصول للحالة المطلوبة.

مثلاً:

```mermaid
flowchart TD
    A["Desired State<br/>3 Pods"] -->|compare| B["Current State<br/>2 Pods"]
    B --> C[Kubernetes takes action]
    C --> D["3 Pods"]
```

وده مفهوم أساسي جدًا في Kubernetes وهيرجع معانا باستمرار.

---

## 5. Kubernetes and Automation

بدون Kubernetes، ممكن تكون مسؤول عن حاجات كتير manually:

```mermaid
flowchart TB
    D["Deploy"] --> SC["Start Containers"]
    SC --> H["Check Health"]
    H --> R["Replace Failed Containers"]
    R --> S["Scale"]
    S --> N["Configure Networking"]
    N --> U["Update Application"]
    U --> M["Monitor"]

    classDef process fill:#eef3f1,stroke:#78968c,stroke-width:2px,color:#2f403a;

    class D,SC,H,R,S,N,U,M process;
```

ف Kubernetes بيقدم mechanisms تساعد في أتمتة العمليات دي.

```mermaid
flowchart TD
    A[Kubernetes] --> B[Deploy]
    A --> C[Scale]
    A --> D[Recover]
    B --> E[Automated Management]
    C --> E
    D --> E
```

المهم إن Kubernetes **مش magic**؛ هو platform فيها components وcontrollers وAPIs بتتعاون عشان تحقق الـdesired state.

---

## 6. Kubernetes at a High Level

ممكن أشوف Kubernetes كطبقة management فوق الـinfrastructure والـcontainer runtime.

```mermaid
flowchart TD
    A["My Applications<br/>Containerized Workloads"] --> B["Kubernetes<br/>Deployment / Scaling / Network<br/>Scheduling / Self-Healing / ..."]
    B --> C["Infrastructure<br/>VMs / Physical Machines / ..."]
```

Kubernetes therefore acts as a **management and orchestration layer** between my workloads and the underlying infrastructure.

---

## 7. Kubernetes Cluster

الـKubernetes environment بيتكون من **Cluster**.

الـCluster عبارة عن مجموعة من machines بتشارك في تشغيل وإدارة الـworkloads.

بشكل مبسط:

```mermaid
flowchart TB
    A[Kubernetes Cluster]

    A --> B[Control Plane]
    A --> C[Worker Node]
    A --> D[Worker Node]
    A --> E[Worker Node]

    C --> C1[Pods]
    D --> D1[Pods]
    E --> E1[Pods]
```

الـControl Plane مسؤول عن **management and orchestration**، والـWorker Nodes بتشغل الـworkloads.

---

## 8. Kubernetes Does Not Replace Containers

 عندنا Kubernetes مش بديل عن الـ containers.

الـrelationship بينهم أقرب لكده:

```mermaid
flowchart TD
    A[Container] -->|is the unit being run| B[Container Runtime]
    B --> C[Kubernetes]
    C -->|manages and orchestrates| D[Containerized Workloads]
```

ف Kubernetes يحتاج **Container Runtime** لتشغيل الـcontainers على الـNodes.

ومن أمثلة الـruntimes المستخدمة مع Kubernetes:

* containerd
* CRI-O

فأنا ممكن أفكر فيهم كده:

> **Container Runtime runs the container.**
> **Kubernetes manages the workload and coordinates the environment around it.**

---

## 9. What Problems Does Kubernetes Help Solve?

عندنا Kubernetes بيقدم mechanisms لحل مجموعة كبيرة من مشاكل تشغيل الـcontainerized applications.

### Deployment

يساعدني في تشغيل application workloads بطريقة declarative وautomated.

### Scaling

أقدر أزود أو أقلل عدد الـapplication instances حسب احتياجي.

### Self-Healing

لو workload اتعرض لمشكلة، Kubernetes عنده mechanisms تساعد في إعادة الـworkload للحالة المطلوبة.

### Service Discovery

بيوفر mechanisms تساعد الـapplications والـservices إنها تتواصل مع بعضها داخل الـcluster.

### Load Distribution

يساعد في توجيه الـnetwork traffic إلى الـappropriate application instances.

### Rolling Updates

يساعد في تحديث الـapplication تدريجيًا بدل ما أوقف كل الـinstances مرة واحدة.

### Resource Management

أقدر أحدد resource requirements وlimits للـworkloads.


---

## 10. A Simple Example

افترض إن عندي web application:

```mermaid
flowchart TD
    A[Web Application] --> B[Pod]
    A --> C[Pod]
    A --> D[Pod]
    B --> E[App #1]
    C --> F[App #2]
    D --> G[App #3]
```

وأنا عايز دائمًا يكون عندي:

```text
3 application instances
```

لو واحد من الـPods اختفى:

```mermaid
flowchart LR
    D["Desired = 3"] --> C["Current = 2"]

    classDef state fill:#f3eef4,stroke:#9a7fa0,stroke-width:2px,color:#3e3342;

    class D,C state;
```

ف Kubernetes يلاحظ إن الـcurrent state مش مطابق للـdesired state، ويبدأ mechanisms لتحقيق الحالة المطلوبة.

```mermaid
flowchart TD
    A["Desired State<br/>3 Pods"] --> B[Kubernetes]
    B --> C["Current State<br/>2 Pods"]
    C --> D[Reconciliation]
    D --> E["3 Pods"]
```

الفكرة دي من أهم الأفكار اللي لازم تفضل ثابتة في الدماغ اثناء تعلم Kubernetes.

---

## 11. Kubernetes Declarative Model

عندنا Kubernetes بيعتمد بشكل كبير على **Declarative Configuration**.

يعني بدل ما أقول:

```mermaid
flowchart TB
    S1["1. Start Container"] --> S2["2. Start Another Container"]
    S2 --> R["3. If One Dies<br/>Start It Again"]
    R --> K["4. Keep 3 Instances Running"]

    classDef process fill:#eef3f1,stroke:#78968c,stroke-width:2px,color:#2f403a;

    class S1,S2,R,K process;
```

أنا بحدد الـdesired state:

```yaml
replicas: 3
```

وأقول لـKubernetes:

> **This is the state I want.**

وبعد كده Kubernetes يتولى عملية الوصول والمحافظة على الحالة دي.

```mermaid
flowchart LR
    A[Desired State] --> B[Kubernetes]
    B --> C[Current State]
    C --> D{State matches?}
    D -->|Yes| E[Keep Monitoring]
    D -->|No| F[Take Action]
    F --> C
```

ده بيمهد لمفهوم مهم  اسمه:

**Reconciliation Loop**

واللي هنشوفه كتير  بعدين.

---

## 12. Kubernetes in One Sentence

لو محتاج أفتكر Kubernetes في جملة واحدة:

> **Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, management, and operation of containerized workloads across a cluster of machines.**

---

## 13. Mental Model

في النهاية، الصورة اللي عايز أخرج بيها من الصفحة دي هي:

```mermaid
flowchart TB
    A[My Application]
    B[Containerized Workload]
    C[Kubernetes]
    D[Kubernetes Cluster]
    E[Infrastructure]

    A --> B
    B --> C
    C --> D
    D --> E
```

لكن العلاقة الحقيقية أهم من مجرد الشكل:

```mermaid
flowchart TD
    A[Application] --> B[Containerized Workload]
    B --> C[Kubernetes]
    C --> D[Deploy]
    C --> E[Scale]
    C --> F[Schedule]
    C --> G[Manage]
    C --> H[Recover]
    C --> I[Network]
    C --> J[Kubernetes Cluster]
    J --> K[Infrastructure]
```
