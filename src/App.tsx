import { type ChangeEvent, type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  Trash2,
  Users,
  X,
} from "lucide-react";

type Role = "Administrator" | "Project Manager" | "Field Crew";
type View =
  | "dashboard"
  | "projects"
  | "employees"
  | "materials"
  | "progress"
  | "incidents"
  | "reports";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type Project = {
  id: number;
  name: string;
  location: string;
  manager: string;
  status: string;
  progress: number;
  budget: number;
  deadline: string | null;
};

type Employee = {
  id: number;
  fullName: string;
  position: string;
  projectName: string | null;
  status: string;
};

type Material = {
  id: number;
  name: string;
  movementType: string;
  quantity: string;
  destination: string;
  imageUrl?: string;
};

type Incident = {
  id: number;
  description: string;
  priority: string;
  projectName: string;
  evidenceCount: number;
};

type ProgressUpdate = { id:number; projectName:string; phase:string; percentComplete:number; notes:string; reportedOn:string };
type Report = { id:number; title:string; reportType:string; periodLabel:string; metricValue:number; metricUnit:string; status:string };

type DashboardData = {
  projects: Project[];
  employees: Employee[];
  materials: Material[];
  incidents: Incident[];
  progressUpdates: ProgressUpdate[];
  reports: Report[];
};

type ModalType = "project" | "employee" | "material" | "incident" | "progress" | "report" | null;

type MaterialImagePayload = {
  fileName: string;
  mimeType: string;
  data: string;
};

const rolePermissions: Record<Role, View[]> = {
  Administrator: [
    "dashboard",
    "projects",
    "employees",
    "materials",
    "progress",
    "incidents",
    "reports",
  ],
  "Project Manager": [
    "dashboard",
    "projects",
    "materials",
    "progress",
    "incidents",
    "reports",
  ],
  "Field Crew": ["dashboard", "progress", "incidents"],
};

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "employees", label: "Crew", icon: Users },
  { id: "materials", label: "Materials", icon: Boxes },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const emptyData: DashboardData = {
  projects: [],
  employees: [],
  materials: [],
  incidents: [],
  progressUpdates: [],
  reports: [],
};

const apiGet = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
};

const apiPost = async <T,>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
};

const apiDelete = async (url: string) => {
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@ccconstruction.us");
  const [loginPassword, setLoginPassword] = useState("construction2026");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [data, setData] = useState<DashboardData>(emptyData);
  const [searchQuery,setSearchQuery]=useState("");
  const [dataStatus, setDataStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [projectForm, setProjectForm] = useState({
    name: "",
    location: "",
    manager: "",
    status: "In progress",
    progress: "0",
    budget: "0",
    deadline: "",
  });
  const [materialForm, setMaterialForm] = useState({
    name: "",
    movementType: "Inbound",
    quantity: "",
    destination: "",
    image: null as MaterialImagePayload | null,
  });
  const [incidentForm, setIncidentForm] = useState({
    description: "",
    priority: "Low",
    projectName: "",
    evidenceCount: "0",
  });
  const [employeeForm, setEmployeeForm] = useState({ fullName:"", position:"", projectName:"", status:"Active" });
  const [progressForm, setProgressForm] = useState({ projectName:"", phase:"", percentComplete:"0", notes:"", reportedOn:new Date().toISOString().slice(0,10) });
  const [reportForm, setReportForm] = useState({ title:"", reportType:"Progress", periodLabel:"", metricValue:"0", metricUnit:"percent", status:"Current" });

  const visibleNav = useMemo(() => {
    const permissions = currentUser ? rolePermissions[currentUser.role] : [];
    return navItems.filter((item) => permissions.includes(item.id));
  }, [currentUser]);

  const filteredData=useMemo(()=>{const q=searchQuery.trim().toLowerCase();if(!q)return data;const has=(...values:unknown[])=>values.some(v=>String(v??"").toLowerCase().includes(q));return{
    projects:data.projects.filter(x=>has(x.name,x.location,x.manager,x.status)),
    employees:data.employees.filter(x=>has(x.fullName,x.position,x.projectName,x.status)),
    materials:data.materials.filter(x=>has(x.name,x.movementType,x.quantity,x.destination)),
    incidents:data.incidents.filter(x=>has(x.description,x.priority,x.projectName)),
    progressUpdates:data.progressUpdates.filter(x=>has(x.projectName,x.phase,x.notes,x.reportedOn)),
    reports:data.reports.filter(x=>has(x.title,x.reportType,x.periodLabel,x.status)),
  }},[data,searchQuery]);

  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setDataStatus("loading");

    Promise.all([
      apiGet<Project[]>("/api/projects"),
      apiGet<Employee[]>("/api/employees"),
      apiGet<Material[]>("/api/materials"),
      apiGet<Incident[]>("/api/incidents"),
      apiGet<ProgressUpdate[]>("/api/progress"),
      apiGet<Report[]>("/api/reports"),
    ])
      .then(([projects, employees, materials, incidents, progressUpdates, reports]) => {
        if (!active) return;
        setData({ projects, employees, materials, incidents, progressUpdates, reports });
        setDataStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setData(emptyData);
        setDataStatus("error");
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const payload = (await response.json()) as { user: User };
      setCurrentUser(payload.user);
      setActiveView("dashboard");
    } catch {
      setLoginError("Email or password is incorrect.");
    } finally {
      setLoginLoading(false);
    }
  };

  const openView = (view: View) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const openCreateModal = (type: Exclude<ModalType, null>) => {
    setSaveError("");
    setActiveModal(type);
  };

  const closeCreateModal = () => {
    if (saving) return;
    setActiveModal(null);
    setSaveError("");
  };

  const handleCreateProject = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const project = await apiPost<Project>("/api/projects", {
        ...projectForm,
        progress: Number(projectForm.progress),
        budget: Number(projectForm.budget),
        deadline: projectForm.deadline || null,
      });

      setData((current) => ({ ...current, projects: [project, ...current.projects] }));
      setProjectForm({
        name: "",
        location: "",
        manager: "",
        status: "In progress",
        progress: "0",
        budget: "0",
        deadline: "",
      });
      setActiveModal(null);
    } catch {
      setSaveError("Could not save the project.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMaterial = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const material = await apiPost<Material>("/api/materials", materialForm);
      setData((current) => ({ ...current, materials: [material, ...current.materials] }));
      setMaterialForm({
        name: "",
        movementType: "Inbound",
        quantity: "",
        destination: "",
        image: null,
      });
      setActiveModal(null);
    } catch {
      setSaveError("Could not save the material.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateIncident = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const incident = await apiPost<Incident>("/api/incidents", {
        ...incidentForm,
        evidenceCount: Number(incidentForm.evidenceCount),
      });

      setData((current) => ({ ...current, incidents: [incident, ...current.incidents] }));
      setIncidentForm({
        description: "",
        priority: "Low",
        projectName: "",
        evidenceCount: "0",
      });
      setActiveModal(null);
    } catch {
      setSaveError("Could not save the incident.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEmployee = async (event:FormEvent) => { event.preventDefault(); setSaving(true); setSaveError(""); try { const employee=await apiPost<Employee>("/api/employees",employeeForm); setData(c=>({...c,employees:[employee,...c.employees]})); setEmployeeForm({fullName:"",position:"",projectName:"",status:"Active"}); setActiveModal(null); } catch { setSaveError("Could not save the crew member."); } finally { setSaving(false); } };
  const handleCreateProgress = async (event:FormEvent) => { event.preventDefault(); setSaving(true); setSaveError(""); try { const update=await apiPost<ProgressUpdate>("/api/progress",{...progressForm,percentComplete:Number(progressForm.percentComplete)}); setData(c=>({...c,progressUpdates:[update,...c.progressUpdates]})); setProgressForm({projectName:"",phase:"",percentComplete:"0",notes:"",reportedOn:new Date().toISOString().slice(0,10)}); setActiveModal(null); } catch { setSaveError("Could not save the progress update."); } finally { setSaving(false); } };
  const handleCreateReport = async (event:FormEvent) => { event.preventDefault(); setSaving(true); setSaveError(""); try { const report=await apiPost<Report>("/api/reports",{...reportForm,metricValue:Number(reportForm.metricValue)}); setData(c=>({...c,reports:[report,...c.reports]})); setReportForm({title:"",reportType:"Progress",periodLabel:"",metricValue:"0",metricUnit:"percent",status:"Current"}); setActiveModal(null); } catch { setSaveError("Could not save the report."); } finally { setSaving(false); } };

  const handleMaterialImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setMaterialForm((current) => ({ ...current, image: null }));
      return;
    }

    const data = await fileToBase64(file);
    setMaterialForm((current) => ({
      ...current,
      image: {
        fileName: file.name,
        mimeType: file.type,
        data,
      },
    }));
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm("Delete this project?")) return;
    await apiDelete(`/api/projects/${id}`);
    setData((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id),
    }));
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm("Delete this crew member?")) return;
    await apiDelete(`/api/employees/${id}`);
    setData((current) => ({
      ...current,
      employees: current.employees.filter((employee) => employee.id !== id),
    }));
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!window.confirm("Delete this material and its saved photo folder?")) return;
    await apiDelete(`/api/materials/${id}`);
    setData((current) => ({
      ...current,
      materials: current.materials.filter((material) => material.id !== id),
    }));
  };

  const handleDeleteIncident = async (id: number) => {
    if (!window.confirm("Delete this incident?")) return;
    await apiDelete(`/api/incidents/${id}`);
    setData((current) => ({
      ...current,
      incidents: current.incidents.filter((incident) => incident.id !== id),
    }));
  };
  const handleDeleteProgress = async(id:number)=>{if(!window.confirm("Delete this progress update?"))return;await apiDelete(`/api/progress/${id}`);setData(c=>({...c,progressUpdates:c.progressUpdates.filter(x=>x.id!==id)}));};
  const handleDeleteReport = async(id:number)=>{if(!window.confirm("Delete this report?"))return;await apiDelete(`/api/reports/${id}`);setData(c=>({...c,reports:c.reports.filter(x=>x.id!==id)}));};

  if (!currentUser) {
    return (
      <main className="login-page">
        <section className="login-visual" aria-label="Raul Coronado Custom Cabinets">
          <div className="brand-mark">
            <Building2 size={30} />
          </div>
          <div>
            <p className="eyebrow">Raul Coronado Custom Cabinets</p>
            <h1>Custom cabinet project management</h1>
            <p>
              Field-ready operations for schedules, crews, material inventory,
              installation progress, photo evidence and executive reporting.
            </p>
          </div>
          <div className="site-card">
            <div>
              <span>Portfolio progress</span>
              <strong>Live</strong>
            </div>
            <div className="progress-line">
              <span style={{ width: "64%" }} />
            </div>
          </div>
        </section>

        <section className="login-panel" aria-label="Sign in">
          <div className="mobile-brand">
            <Building2 />
            <strong>Raul Coronado Custom Cabinets</strong>
          </div>
          <div className="panel-header">
            <p className="eyebrow">Secure access</p>
            <h2>Sign in</h2>
          </div>
          <label>
            Email
            <input
              autoComplete="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleLogin();
              }}
            />
          </label>
          {loginError ? <p className="form-error">{loginError}</p> : null}
          <button
            className="primary-action"
            disabled={loginLoading}
            type="button"
            onClick={handleLogin}
          >
            <ShieldCheck size={18} />
            {loginLoading ? "Checking..." : "Enter workspace"}
          </button>
          <p className="login-note">
            Use the SQL script user seed, then sign in with one of those accounts.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark small">
            <Building2 size={22} />
          </div>
          <div>
            <strong>Raul Coronado Custom Cabinets</strong>
            <span>Cabinet operations</span>
          </div>
          <button className="icon-button close-nav" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? "active" : ""}
                key={item.id}
                type="button"
                onClick={() => openView(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="search-box">
            <Search size={18} />
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search all operational records" />
          </div>
          <div className="user-pill">
            <span>{currentUser.role}</span>
            <strong>{currentUser.name}</strong>
          </div>
          <button className="icon-button" type="button" onClick={() => setCurrentUser(null)} aria-label="Sign out">
            <LogOut size={19} />
          </button>
        </header>

        <section className="content">
          {dataStatus === "loading" ? <StatusPanel message="Loading SQL Server records..." /> : null}
          {dataStatus === "error" ? <StatusPanel message="Could not load dashboard records from the API." tone="error" /> : null}
          {dataStatus !== "loading" ? (
            <ViewRenderer
              view={activeView}
              role={currentUser.role}
              data={filteredData}
              onDeleteEmployee={handleDeleteEmployee}
              onDeleteIncident={handleDeleteIncident}
              onDeleteMaterial={handleDeleteMaterial}
              onDeleteProject={handleDeleteProject}
              onDeleteProgress={handleDeleteProgress}
              onDeleteReport={handleDeleteReport}
              onAddProject={() => openCreateModal("project")}
              onAddMaterial={() => openCreateModal("material")}
              onAddIncident={() => openCreateModal("incident")}
              onAddEmployee={() => openCreateModal("employee")}
              onAddProgress={() => openCreateModal("progress")}
              onAddReport={() => openCreateModal("report")}
            />
          ) : null}
        </section>
      </main>
      <CreateModal
        activeModal={activeModal}
        closeCreateModal={closeCreateModal}
        data={data}
        handleCreateIncident={handleCreateIncident}
        handleCreateMaterial={handleCreateMaterial}
        handleCreateProject={handleCreateProject}
        handleCreateEmployee={handleCreateEmployee}
        handleCreateProgress={handleCreateProgress}
        handleCreateReport={handleCreateReport}
        handleMaterialImage={handleMaterialImage}
        incidentForm={incidentForm}
        materialForm={materialForm}
        projectForm={projectForm}
        employeeForm={employeeForm}
        progressForm={progressForm}
        reportForm={reportForm}
        saveError={saveError}
        saving={saving}
        setIncidentForm={setIncidentForm}
        setMaterialForm={setMaterialForm}
        setProjectForm={setProjectForm}
        setEmployeeForm={setEmployeeForm}
        setProgressForm={setProgressForm}
        setReportForm={setReportForm}
      />
    </div>
  );
}

function ViewRenderer({
  view,
  role,
  data,
  onAddProject,
  onAddMaterial,
  onAddIncident,
  onAddEmployee,
  onAddProgress,
  onAddReport,
  onDeleteProject,
  onDeleteEmployee,
  onDeleteMaterial,
  onDeleteIncident,
  onDeleteProgress,
  onDeleteReport,
}: {
  view: View;
  role: Role;
  data: DashboardData;
  onAddProject: () => void;
  onAddMaterial: () => void;
  onAddIncident: () => void;
  onAddEmployee: () => void;
  onAddProgress: () => void;
  onAddReport: () => void;
  onDeleteProject: (id: number) => void;
  onDeleteEmployee: (id: number) => void;
  onDeleteMaterial: (id: number) => void;
  onDeleteIncident: (id: number) => void;
  onDeleteProgress: (id:number)=>void;
  onDeleteReport: (id:number)=>void;
}) {
  if (view === "projects") return <ProjectsView projects={data.projects} onAddProject={onAddProject} onDeleteProject={onDeleteProject} />;
  if (view === "employees") return <EmployeesView employees={data.employees} onAddEmployee={onAddEmployee} onDeleteEmployee={onDeleteEmployee} />;
  if (view === "materials") return <MaterialsView materials={data.materials} onAddMaterial={onAddMaterial} onDeleteMaterial={onDeleteMaterial} />;
  if (view === "progress") return <ProgressView updates={data.progressUpdates} onAddProgress={onAddProgress} onDeleteProgress={onDeleteProgress} />;
  if (view === "incidents") return <IncidentsView incidents={data.incidents} onAddIncident={onAddIncident} onDeleteIncident={onDeleteIncident} />;
  if (view === "reports") return <ReportsView reports={data.reports} projects={data.projects} employees={data.employees} onAddReport={onAddReport} onDeleteReport={onDeleteReport} />;
  return <Dashboard role={role} data={data} />;
}

function PageTitle({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">Field operations</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action ? (
        <button className="secondary-action" type="button" onClick={onAction}>
          <Plus size={17} />
          {action}
        </button>
      ) : null}
    </div>
  );
}

function Dashboard({ role, data }: { role: Role; data: DashboardData }) {
  const activeProjects = data.projects.filter((project) =>
    project.status.toLowerCase().includes("progress"),
  ).length;
  const activeCrew = data.employees.filter((employee) =>
    employee.status.toLowerCase().includes("active"),
  ).length;
  const inboundLoads = data.materials.filter((material) =>
    material.movementType.toLowerCase().includes("inbound"),
  ).length;
  const highIncidents = data.incidents.filter((incident) =>
    incident.priority.toLowerCase().includes("high"),
  ).length;
  const totalBudget = data.projects.reduce((sum, project) => sum + Number(project.budget || 0), 0);

  return (
    <>
      <PageTitle
        title="Main dashboard"
        subtitle={`Operational overview for the ${role} role.`}
      />
      <div className="metric-grid">
        <Metric icon={BriefcaseBusiness} label="Active jobs" value={String(activeProjects)} trend={`${data.projects.length} total projects`} />
        <Metric icon={Users} label="Crew active" value={String(activeCrew)} trend={`${data.employees.length} registered crew`} />
        <Metric icon={PackageCheck} label="Material moves" value={String(data.materials.length)} trend={`${inboundLoads} inbound loads`} />
        <Metric icon={AlertTriangle} label="Open incidents" value={String(data.incidents.length)} trend={`${highIncidents} high priority`} />
      </div>
      <div className="split-layout">
        <section className="panel wide">
          <div className="panel-heading">
            <h3>Priority jobs</h3>
            <CalendarDays size={18} />
          </div>
          {data.projects.length ? (
            <div className="project-list">
              {data.projects.slice(0, 5).map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState message="No projects saved in SQL Server yet." />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h3>Live summary</h3>
            <Clock3 size={18} />
          </div>
          <Timeline data={data} totalBudget={totalBudget} />
        </section>
      </div>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="project-row">
      <div className="project-main">
        <h4>{project.name}</h4>
        <p>{project.location} - Lead: {project.manager}</p>
      </div>
      <div className="project-meta">
        <span className={`status ${isPlanned(project.status) ? "planned" : ""}`}>
          {project.status}
        </span>
        <strong>{project.progress}%</strong>
      </div>
      <div className="progress-line">
        <span style={{ width: `${project.progress}%` }} />
      </div>
    </article>
  );
}

function Timeline({ data, totalBudget }: { data: DashboardData; totalBudget: number }) {
  const events = [
    `${data.projects.length} projects loaded with ${currency.format(totalBudget)} assigned budget.`,
    `${data.employees.length} crew records are available for assignment tracking.`,
    `${data.materials.length} material movements are saved in inventory control.`,
    `${data.incidents.length} incidents include ${data.incidents.reduce((sum, incident) => sum + incident.evidenceCount, 0)} evidence files.`,
  ];

  return (
    <div className="timeline">
      {events.map((text, index) => (
        <div className="timeline-item" key={text}>
          <span>{`0${index + 1}`}</span>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

function ProjectsView({
  projects,
  onAddProject,
  onDeleteProject,
}: {
  projects: Project[];
  onAddProject: () => void;
  onDeleteProject: (id: number) => void;
}) {
  return (
    <>
      <PageTitle title="Cabinet projects" subtitle="Track custom cabinet jobs, budgets, leads and delivery dates." action="New project" onAction={onAddProject} />
      {projects.length ? (
        <div className="cards-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="panel-heading">
                <HardHat size={20} />
                <div className="row-tools">
                  <span className={`status ${isPlanned(project.status) ? "planned" : ""}`}>{project.status}</span>
                  <DeleteButton label={`Delete ${project.name}`} onClick={() => onDeleteProject(project.id)} />
                </div>
              </div>
              <h3>{project.name}</h3>
              <p>{project.location}</p>
              <dl>
                <div><dt>Budget</dt><dd>{currency.format(Number(project.budget || 0))}</dd></div>
                <div><dt>Delivery</dt><dd>{formatDate(project.deadline)}</dd></div>
                <div><dt>Lead</dt><dd>{project.manager}</dd></div>
              </dl>
              <div className="progress-line">
                <span style={{ width: `${project.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyPanel message="No projects saved in SQL Server yet." />
      )}
    </>
  );
}

function EmployeesView({
  employees,
  onAddEmployee,
  onDeleteEmployee,
}: {
  employees: Employee[];
  onAddEmployee:()=>void;
  onDeleteEmployee: (id: number) => void;
}) {
  return (
    <>
      <PageTitle title="Crew management" subtitle="Register field teams, job assignments and work status." action="Add crew member" onAction={onAddEmployee} />
      <DataTable
        icon={Users}
        columns={["Name", "Position", "Job", "Status", "Action"]}
        rows={employees.map((employee) => ({
          id: employee.id,
          cells: [
            employee.fullName,
            employee.position,
            employee.projectName ?? "Unassigned",
            employee.status,
            <DeleteButton label={`Delete ${employee.fullName}`} onClick={() => onDeleteEmployee(employee.id)} />,
          ],
        }))}
      />
    </>
  );
}

function MaterialsView({
  materials,
  onAddMaterial,
  onDeleteMaterial,
}: {
  materials: Material[];
  onAddMaterial: () => void;
  onDeleteMaterial: (id: number) => void;
}) {
  return (
    <>
      <PageTitle title="Materials control" subtitle="Inbound loads, outbound deliveries and job allocations." action="Log movement" onAction={onAddMaterial} />
      <DataTable
        icon={Boxes}
        columns={["Material", "Type", "Quantity", "Destination", "Photo", "Action"]}
        rows={materials.map((material) => ({
          id: material.id,
          cells: [
            material.name,
            material.movementType,
            material.quantity,
            material.destination,
            <MaterialPhoto material={material} />,
            <DeleteButton label={`Delete ${material.name}`} onClick={() => onDeleteMaterial(material.id)} />,
          ],
        }))}
      />
    </>
  );
}

function ProgressView({ updates,onAddProgress,onDeleteProgress }: { updates:ProgressUpdate[];onAddProgress:()=>void;onDeleteProgress:(id:number)=>void }) {
  return (
    <>
      <PageTitle title="Jobsite progress" subtitle="Percentage tracking by job, phase and weekly review." action="Update progress" onAction={onAddProgress} />
      <section className="panel">
        {updates.length ? (
          <div className="progress-board">
            {updates.map((update) => (
              <div className="phase-row" key={update.id}>
                <div>
                  <strong>{update.projectName} · {update.phase}</strong>
                  <span>{update.notes} · {formatDate(update.reportedOn)}</span>
                </div>
                <div className="progress-line">
                  <span style={{ width: `${update.percentComplete}%` }} />
                </div>
                <b>{update.percentComplete}%</b>
                <DeleteButton label={`Delete update ${update.id}`} onClick={()=>onDeleteProgress(update.id)}/>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No project progress available yet." />
        )}
      </section>
    </>
  );
}

function IncidentsView({
  incidents,
  onAddIncident,
  onDeleteIncident,
}: {
  incidents: Incident[];
  onAddIncident: () => void;
  onDeleteIncident: (id: number) => void;
}) {
  return (
    <>
      <PageTitle title="Incidents and evidence" subtitle="Log events, priorities and attached jobsite photos." action="New incident" onAction={onAddIncident} />
      <DataTable
        icon={Camera}
        columns={["Incident", "Priority", "Job", "Evidence", "Action"]}
        rows={incidents.map((incident) => ({
          id: incident.id,
          cells: [
            incident.description,
            incident.priority,
            incident.projectName,
            `${incident.evidenceCount} files`,
            <DeleteButton label={`Delete incident ${incident.id}`} onClick={() => onDeleteIncident(incident.id)} />,
          ],
        }))}
      />
    </>
  );
}

function ReportsView({ reports,projects,employees,onAddReport,onDeleteReport }: { reports:Report[];projects:Project[];employees:Employee[];onAddReport:()=>void;onDeleteReport:(id:number)=>void }) {
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
    : 0;
  const assignedCrew = employees.filter((employee) => employee.projectName).length;
  const productivity = employees.length ? Math.round((assignedCrew / employees.length) * 100) : 0;

  return (
    <>
      <PageTitle title="Reports and analytics" subtitle="Executive indicators for productivity, cost and progress." action="New report" onAction={onAddReport} />
      <div className="report-grid">
        <section className="panel">
          <div className="panel-heading">
            <h3>Progress by job</h3>
            <BarChart3 size={18} />
          </div>
          {projects.length ? (
            <div className="bar-chart">
              {projects.map((project) => (
                <div key={project.id}>
                  <span>{project.name}</span>
                  <div><i style={{ width: `${project.progress}%` }} /></div>
                  <strong>{project.progress}%</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No project progress available yet." />
          )}
        </section>
        <section className="panel report-summary">
          <CheckCircle2 size={32} />
          <h3>Portfolio progress</h3>
          <strong>{averageProgress}%</strong>
          <p>{productivity}% of registered crew has a project assignment.</p>
        </section>
      </div>
      <DataTable icon={BarChart3} columns={["Report","Type","Period","Value","Status","Action"]} rows={reports.map(report=>({id:report.id,cells:[report.title,report.reportType,report.periodLabel,`${Number(report.metricValue).toLocaleString()} ${report.metricUnit}`,report.status,<DeleteButton label={`Delete ${report.title}`} onClick={()=>onDeleteReport(report.id)}/>]}))}/>
    </>
  );
}

function DataTable({
  icon: Icon,
  columns,
  rows,
}: {
  icon: typeof LayoutDashboard;
  columns: string[];
  rows: { id: number | string; cells: ReactNode[] }[];
}) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <h3>Records</h3>
        <Icon size={18} />
      </div>
      {rows.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((cell, index) => (
                    <td key={`${row.id}-${index}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No records saved in SQL Server yet." />
      )}
    </section>
  );
}

function MaterialPhoto({ material }: { material: Material }) {
  if (!material.imageUrl) return <span className="photo-empty">No photo</span>;

  return (
    <a href={material.imageUrl} target="_blank" rel="noreferrer" aria-label={`Open ${material.name} photo`}>
      <img className="material-thumb" src={material.imageUrl} alt={material.name} />
    </a>
  );
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="delete-button" type="button" onClick={onClick} aria-label={label} title={label}>
      <Trash2 size={16} />
    </button>
  );
}

function CreateModal({
  activeModal,
  closeCreateModal,
  data,
  handleCreateIncident,
  handleCreateMaterial,
  handleCreateProject,
  handleCreateEmployee,
  handleCreateProgress,
  handleCreateReport,
  handleMaterialImage,
  incidentForm,
  materialForm,
  projectForm,
  employeeForm,
  progressForm,
  reportForm,
  saveError,
  saving,
  setIncidentForm,
  setMaterialForm,
  setProjectForm,
  setEmployeeForm,
  setProgressForm,
  setReportForm,
}: {
  activeModal: ModalType;
  closeCreateModal: () => void;
  data: DashboardData;
  handleCreateIncident: (event: FormEvent) => void;
  handleCreateMaterial: (event: FormEvent) => void;
  handleCreateProject: (event: FormEvent) => void;
  handleCreateEmployee:(event:FormEvent)=>void;
  handleCreateProgress:(event:FormEvent)=>void;
  handleCreateReport:(event:FormEvent)=>void;
  handleMaterialImage: (event: ChangeEvent<HTMLInputElement>) => void;
  incidentForm: { description: string; priority: string; projectName: string; evidenceCount: string };
  materialForm: { name: string; movementType: string; quantity: string; destination: string; image: MaterialImagePayload | null };
  projectForm: { name: string; location: string; manager: string; status: string; progress: string; budget: string; deadline: string };
  employeeForm:{fullName:string;position:string;projectName:string;status:string};
  progressForm:{projectName:string;phase:string;percentComplete:string;notes:string;reportedOn:string};
  reportForm:{title:string;reportType:string;periodLabel:string;metricValue:string;metricUnit:string;status:string};
  saveError: string;
  saving: boolean;
  setIncidentForm: Dispatch<SetStateAction<{ description: string; priority: string; projectName: string; evidenceCount: string }>>;
  setMaterialForm: Dispatch<SetStateAction<{ name: string; movementType: string; quantity: string; destination: string; image: MaterialImagePayload | null }>>;
  setProjectForm: Dispatch<SetStateAction<{ name: string; location: string; manager: string; status: string; progress: string; budget: string; deadline: string }>>;
  setEmployeeForm:Dispatch<SetStateAction<{fullName:string;position:string;projectName:string;status:string}>>;
  setProgressForm:Dispatch<SetStateAction<{projectName:string;phase:string;percentComplete:string;notes:string;reportedOn:string}>>;
  setReportForm:Dispatch<SetStateAction<{title:string;reportType:string;periodLabel:string;metricValue:string;metricUnit:string;status:string}>>;
}) {
  if (!activeModal) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">New record</p>
            <h3>
              {activeModal === "project"
                ? "Add project"
                : activeModal === "material"
                  ? "Add material"
                  : activeModal === "employee" ? "Add crew member" : activeModal === "progress" ? "Add progress update" : activeModal === "report" ? "Add report" : "Add incident"}
            </h3>
          </div>
          <button className="icon-button" type="button" onClick={closeCreateModal} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {activeModal === "project" ? (
          <form className="record-form" onSubmit={handleCreateProject}>
            <label>
              Project name
              <input required value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Location
              <input required value={projectForm.location} onChange={(event) => setProjectForm((current) => ({ ...current, location: event.target.value }))} />
            </label>
            <label>
              Manager
              <input required value={projectForm.manager} onChange={(event) => setProjectForm((current) => ({ ...current, manager: event.target.value }))} />
            </label>
            <label>
              Status
              <select value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value }))}>
                <option>In progress</option>
                <option>Scheduled</option>
                <option>Inspection</option>
              </select>
            </label>
            <label>
              Progress
              <input min="0" max="100" type="number" value={projectForm.progress} onChange={(event) => setProjectForm((current) => ({ ...current, progress: event.target.value }))} />
            </label>
            <label>
              Budget
              <input min="0" step="0.01" type="number" value={projectForm.budget} onChange={(event) => setProjectForm((current) => ({ ...current, budget: event.target.value }))} />
            </label>
            <label>
              Deadline
              <input type="date" value={projectForm.deadline} onChange={(event) => setProjectForm((current) => ({ ...current, deadline: event.target.value }))} />
            </label>
            <ModalActions saving={saving} saveError={saveError} onCancel={closeCreateModal} />
          </form>
        ) : null}

        {activeModal === "material" ? (
          <form className="record-form" onSubmit={handleCreateMaterial}>
            <label>
              Material name
              <input required value={materialForm.name} onChange={(event) => setMaterialForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Movement type
              <select value={materialForm.movementType} onChange={(event) => setMaterialForm((current) => ({ ...current, movementType: event.target.value }))}>
                <option>Inbound</option>
                <option>Outbound</option>
                <option>Assigned</option>
              </select>
            </label>
            <label>
              Quantity
              <input required value={materialForm.quantity} onChange={(event) => setMaterialForm((current) => ({ ...current, quantity: event.target.value }))} />
            </label>
            <label>
              Destination
              <input required value={materialForm.destination} onChange={(event) => setMaterialForm((current) => ({ ...current, destination: event.target.value }))} />
            </label>
            <label className="full-field">
              Material photo
              <input accept="image/*" type="file" onChange={handleMaterialImage} />
              {materialForm.image ? <small>{materialForm.image.fileName}</small> : null}
            </label>
            <ModalActions saving={saving} saveError={saveError} onCancel={closeCreateModal} />
          </form>
        ) : null}

        {activeModal === "employee" ? <form className="record-form" onSubmit={handleCreateEmployee}>
          <label>Full name<input required value={employeeForm.fullName} onChange={e=>setEmployeeForm(c=>({...c,fullName:e.target.value}))}/></label>
          <label>Position<input required value={employeeForm.position} onChange={e=>setEmployeeForm(c=>({...c,position:e.target.value}))}/></label>
          <label>Project<select value={employeeForm.projectName} onChange={e=>setEmployeeForm(c=>({...c,projectName:e.target.value}))}><option value="">Unassigned</option>{data.projects.map(p=><option key={p.id}>{p.name}</option>)}</select></label>
          <label>Status<select value={employeeForm.status} onChange={e=>setEmployeeForm(c=>({...c,status:e.target.value}))}><option>Active</option><option>On leave</option><option>Inactive</option></select></label>
          <ModalActions saving={saving} saveError={saveError} onCancel={closeCreateModal}/>
        </form>:null}

        {activeModal === "progress" ? <form className="record-form" onSubmit={handleCreateProgress}>
          <label>Project<select required value={progressForm.projectName} onChange={e=>setProgressForm(c=>({...c,projectName:e.target.value}))}><option value="">Select project</option>{data.projects.map(p=><option key={p.id}>{p.name}</option>)}</select></label>
          <label>Phase<input required value={progressForm.phase} onChange={e=>setProgressForm(c=>({...c,phase:e.target.value}))}/></label>
          <label>Complete %<input required type="number" min="0" max="100" value={progressForm.percentComplete} onChange={e=>setProgressForm(c=>({...c,percentComplete:e.target.value}))}/></label>
          <label>Report date<input required type="date" value={progressForm.reportedOn} onChange={e=>setProgressForm(c=>({...c,reportedOn:e.target.value}))}/></label>
          <label className="full-field">Notes<textarea required value={progressForm.notes} onChange={e=>setProgressForm(c=>({...c,notes:e.target.value}))}/></label>
          <ModalActions saving={saving} saveError={saveError} onCancel={closeCreateModal}/>
        </form>:null}

        {activeModal === "report" ? <form className="record-form" onSubmit={handleCreateReport}>
          <label>Title<input required value={reportForm.title} onChange={e=>setReportForm(c=>({...c,title:e.target.value}))}/></label>
          <label>Type<select value={reportForm.reportType} onChange={e=>setReportForm(c=>({...c,reportType:e.target.value}))}><option>Progress</option><option>Financial</option><option>Safety</option><option>Workforce</option><option>Materials</option><option>Quality</option></select></label>
          <label>Period<input required placeholder="July 2026" value={reportForm.periodLabel} onChange={e=>setReportForm(c=>({...c,periodLabel:e.target.value}))}/></label>
          <label>Value<input required type="number" step="0.01" value={reportForm.metricValue} onChange={e=>setReportForm(c=>({...c,metricValue:e.target.value}))}/></label>
          <label>Unit<input required value={reportForm.metricUnit} onChange={e=>setReportForm(c=>({...c,metricUnit:e.target.value}))}/></label>
          <label>Status<select value={reportForm.status} onChange={e=>setReportForm(c=>({...c,status:e.target.value}))}><option>Current</option><option>Review</option><option>Action needed</option></select></label>
          <ModalActions saving={saving} saveError={saveError} onCancel={closeCreateModal}/>
        </form>:null}

        {activeModal === "incident" ? (
          <form className="record-form" onSubmit={handleCreateIncident}>
            <label className="full-field">
              Description
              <textarea required value={incidentForm.description} onChange={(event) => setIncidentForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label>
              Priority
              <select value={incidentForm.priority} onChange={(event) => setIncidentForm((current) => ({ ...current, priority: event.target.value }))}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Project
              <select
                required
                value={incidentForm.projectName}
                onChange={(event) => setIncidentForm((current) => ({ ...current, projectName: event.target.value }))}
              >
                <option value="">Select project</option>
                {data.projects.map((project) => (
                  <option key={project.id} value={project.name}>{project.name}</option>
                ))}
              </select>
            </label>
            <label>
              Evidence count
              <input min="0" type="number" value={incidentForm.evidenceCount} onChange={(event) => setIncidentForm((current) => ({ ...current, evidenceCount: event.target.value }))} />
            </label>
            <ModalActions saving={saving} saveError={saveError} onCancel={closeCreateModal} />
          </form>
        ) : null}
      </section>
    </div>
  );
}

function ModalActions({
  saving,
  saveError,
  onCancel,
}: {
  saving: boolean;
  saveError: string;
  onCancel: () => void;
}) {
  return (
    <div className="modal-actions">
      {saveError ? <p className="form-error">{saveError}</p> : null}
      <button className="ghost-action" disabled={saving} type="button" onClick={onCancel}>Cancel</button>
      <button className="primary-action inline" disabled={saving} type="submit">
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

function StatusPanel({ message, tone = "info" }: { message: string; tone?: "info" | "error" }) {
  return <div className={`status-panel ${tone}`}>{message}</div>;
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <section className="panel">
      <EmptyState message={message} />
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="empty-state">{message}</p>;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function isPlanned(status: string) {
  const normalized = status.toLowerCase();
  return normalized.includes("scheduled") || normalized.includes("planned");
}

export default App;
