import { useEffect,useState } from 'react';
import type { FormEvent,ReactNode } from 'react';
import { Link,Navigate,NavLink,Route,Routes,useNavigate } from 'react-router-dom';
import { Bar,BarChart,CartesianGrid,Cell,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis } from 'recharts';
import { api } from './services/api'; import { authenticate,continueAsGuest } from './services/authService'; import { entries } from './services/entryService'; import type { Entry,EntryInput } from './types';

const nav=[['/dashboard','Overview','◫'],['/expenses','Expenses','↗'],['/workouts','Workouts','◉'],['/health','Health metrics','♡'],['/goals','Goals','◎'],['/settings','Settings','⚙']];
function Guard({children}:{children:ReactNode}){return localStorage.getItem('fitfinance-token')?children:<Navigate to="/login" replace/>;}
function Shell({children}:{children:ReactNode}){const user=JSON.parse(localStorage.getItem('fitfinance-user')||'{"name":"Member"}');return <div className="min-h-screen md:flex"><aside className="sidebar"><Link to="/dashboard" className="brand"><span className="brand-icon">✳</span><span>fit<span className="text-green">finance</span><small>YOUR WELLNESS, IN BALANCE</small></span></Link><div className="nav-label">WORKSPACE</div><nav>{nav.map(([url,label,icon])=><NavLink key={url} to={url} className={({isActive})=>`nav-link ${isActive?'active':''}`}><span>{icon}</span>{label}</NavLink>)}</nav><div className="side-bottom"><div className="avatar">{user.name?.[0]||'M'}</div><div className="min-w-0 flex-1"><b>{user.name}</b><small>{user.email}</small></div><button aria-label="Sign out" onClick={()=>{localStorage.clear();location.assign('/login')}}>↪</button></div></aside><main className="main-area">{children}</main></div>}
function PageHead({eyebrow,title,sub,action}:{eyebrow:string;title:string;sub:string;action?:ReactNode}){return <div className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function AuthPage({mode}:{mode:'login'|'register'}){const navg=useNavigate();const [error,setError]=useState('');const [busy,setBusy]=useState(false);const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setError('');setBusy(true);const form=new FormData(e.currentTarget);try{await authenticate(mode==='login'?'login':'register',{name:String(form.get('name')||''),email:String(form.get('email')),password:String(form.get('password'))});navg('/dashboard');}catch(err:any){setError(err.response?.data?.message||'Unable to connect. Check that the API is running.');}finally{setBusy(false);}};const guest=async()=>{setError('');setBusy(true);try{await continueAsGuest();navg('/dashboard');}catch(err:any){setError(err.response?.data?.message||'Unable to start a guest session. Please try again.');}finally{setBusy(false);}};return <div className="auth-page"><div className="auth-card"><Link to="/login" className="brand"><span className="brand-icon">✳</span><span>fit<span className="text-green">finance</span></span></Link><div className="eyebrow mt-10">A CLEARER PICTURE OF WELLNESS</div><h1>{mode==='login'?'Welcome back':'Create your account'}</h1><p>{mode==='login'?'Sign in to pick up where you left off.':'Track your health spending and habits in one place.'}</p><form onSubmit={submit} className="form-stack">{mode==='register'&&<label>Full name<input name="name" autoComplete="name" required maxLength={80}/></label>}<label>Email address<input type="email" name="email" autoComplete="email" required/></label><label>Password<input type="password" name="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} required/></label>{error&&<div role="alert" className="error-box">{error}</div>}<button className="button primary w-full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}<span>→</span></button></form>{mode==='login'&&<button type="button" className="button secondary w-full mt-5" disabled={busy} onClick={guest}>Continue as guest<span>→</span></button>}<div className="auth-switch">{mode==='login'?<>New to FitFinance? <Link to="/register">Create an account</Link></>:<>Already have an account? <Link to="/login">Sign in</Link></>}</div><div className="auth-note">Your wellness data stays private and secure.</div></div><div className="auth-art"><div className="art-orb orb-one"/><div className="art-orb orb-two"/><div className="art-content"><span className="art-mark">✳</span><div className="eyebrow">HEALTH, MADE VISIBLE</div><h2>Small habits.<br/>A healthier balance.</h2><p>Bring your fitness routine and health spending into focus.</p></div></div></div>}
const cfg:Record<string,{path:string;title:string;sub:string;verb:string;fields:string[];cols:string[]}>={expenses:{path:'expenses',title:'Expenses',sub:'See where your health and fitness budget goes.',verb:'Add expense',fields:['Title','Amount','Category','Date','Description'],cols:['title','amount','category','date']},workouts:{path:'workouts',title:'Workouts',sub:'Keep a simple history of your activity.',verb:'Log workout',fields:['Title','Workout type','Duration (minutes)','Calories burned','Date','Notes'],cols:['title','category','durationMinutes','date']},health:{path:'health-metrics',title:'Health metrics',sub:'Track basic metrics over time. This is not medical advice.',verb:'Add metric',fields:['Title','Weight','Steps','Calories','Date'],cols:['date','weight','steps','calories']},goals:{path:'goals',title:'Goals',sub:'Set a target and record your progress.',verb:'Create goal',fields:['Title','Target value','Current value','Unit','Deadline','Status','Date'],cols:['title','targetValue','currentValue','unit','deadline','status']}};

function EntryPage({type}:{type:keyof typeof cfg}) {
  const c = cfg[type],
    [rows, setRows] = useState<Entry[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [editing, setEditing] = useState<Entry | null>(null),
    [query, setQuery] = useState('');

  const refresh = () => {
    setLoading(true);
    entries.list(c.path)
      .then(setRows)
      .catch(() => setError('Could not load records. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [type]);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);
    const value = (label: string) => String(f.get(label) || '');
    const n = (label: string) =>
      value(label) ? Number(value(label)) : null;

    const data: EntryInput = {
      title: value('Title'),
      amount: n('Amount'),
      category: value('Category') || value('Workout type') || null,
      date: value('Date'),
      description: value('Description') || value('Notes') || null,
      durationMinutes: n('Duration (minutes)'),
      caloriesBurned: n('Calories burned'),
      weight: n('Weight'),
      steps: n('Steps'),
      calories: n('Calories'),
      targetValue: n('Target value'),
      currentValue: n('Current value'),
      unit: value('Unit') || null,
      deadline: value('Deadline') || null,
      status: value('Status') || null
    };

    try {
      if (editing?.id != null) {
        await entries.update(c.path, editing.id, data);
      } else {
        await entries.create(c.path, data);
      }

      setEditing(null);
      setError('');
      refresh();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Unable to save. Check your entries and try again.'
      );
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this record?')) return;

    try {
      await entries.remove(c.path, id);
      refresh();
    } catch {
      setError('Unable to delete this record.');
    }
  };

  const visible = rows.filter(r =>
    JSON.stringify(r).toLowerCase().includes(query.toLowerCase())
  );

  const input = (field: string) => {
    const label = field;
    let type = 'text',
      name = field;

    if (field === 'Date') {
      type = 'date';
      name = 'Date';
    }

    if (field === 'Deadline') {
      type = 'date';
      name = 'Deadline';
    }

    if (
      [
        'Amount',
        'Weight',
        'Target value',
        'Current value',
        'Duration (minutes)',
        'Calories burned',
        'Steps',
        'Calories'
      ].includes(field)
    ) {
      type = 'number';
    }

    const existing: any = editing;

    const val: Record<string, any> = {
      'Title': existing?.title,
      'Amount': existing?.amount,
      'Category': existing?.category,
      'Workout type': existing?.category,
      'Duration (minutes)': existing?.durationMinutes,
      'Calories burned': existing?.caloriesBurned,
      'Date': existing?.date,
      'Description': existing?.description,
      'Notes': existing?.description,
      'Weight': existing?.weight,
      'Steps': existing?.steps,
      'Calories': existing?.calories,
      'Target value': existing?.targetValue,
      'Current value': existing?.currentValue,
      'Unit': existing?.unit,
      'Deadline': existing?.deadline,
      'Status': existing?.status
    };

    return (
      <label key={field}>
        {label}

        {field === 'Category' ||
        field === 'Workout type' ||
        field === 'Status' ? (
          <select
            name={name}
            defaultValue={val[field] || ''}
            required={field !== 'Status'}
          >
            <option value="">Choose…</option>

            {(
              field === 'Category'
                ? [
                    'GYM',
                    'FOOD',
                    'SUPPLEMENTS',
                    'MEDICAL',
                    'EQUIPMENT',
                    'OTHER'
                  ]
                : field === 'Workout type'
                  ? [
                      'GYM',
                      'RUNNING',
                      'WALKING',
                      'CYCLING',
                      'SPORTS',
                      'HOME_WORKOUT',
                      'OTHER'
                    ]
                  : ['ACTIVE', 'COMPLETED', 'CANCELLED']
            ).map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            type={type}
            min={type === 'number' ? '0' : undefined}
            step={
              field === 'Amount' ||
              field === 'Weight' ||
              field.includes('value')
                ? '0.01'
                : type === 'number'
                  ? '1'
                  : undefined
            }
            defaultValue={
              val[field] ??
              (field === 'Date'
                ? new Date().toISOString().slice(0, 10)
                : '')
            }
            required={
              ['Title', 'Date'].includes(field) ||
              (field === 'Amount' && type === 'expenses')
            }
          />
        )}
      </label>
    );
  };

  return (
    <>
      <PageHead
        eyebrow="TRACK & REVIEW"
        title={c.title}
        sub={c.sub}
        action={
          <button
            className="button primary"
            onClick={() => setEditing({} as Entry)}
          >
            ＋ {c.verb}
          </button>
        }
      />

      {error && (
        <div className="error-box mb-5" role="alert">
          {error}
          <button
            className="float-right"
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}

      <section className="panel">
        <div className="table-toolbar">
          <div>
            <b>{rows.length} records</b>
            <span className="subtle"> · your private history</span>
          </div>

          <input
            className="search"
            placeholder="Search records"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty">Loading your records…</div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">✳</span>
            <b>{rows.length ? 'No matching records' : 'Nothing here yet'}</b>
            <span>
              {rows.length
                ? 'Try a different search.'
                : 'Add your first record to start building a picture.'}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {c.cols.map(x => (
                    <th key={x}>
                      {x.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>

              <tbody>
                {visible.map(r => (
                  <tr key={r.id}>
                    {c.cols.map(k => (
                      <td key={k}>
                        {k === 'amount'
                          ? `$${r.amount?.toFixed(2)}`
                          : String((r as any)[k] ?? '—')}
                      </td>
                    ))}

                    <td className="actions">
                      <button onClick={() => setEditing(r)}>
                        Edit
                      </button>
                      <button
                        className="danger-text"
                        onClick={() => remove(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div
          className="modal-backdrop"
          onMouseDown={e =>
            e.target === e.currentTarget && setEditing(null)
          }
        >
          <section className="modal">
            <div className="modal-head">
              <div>
                <div className="eyebrow">YOUR WELLNESS LOG</div>
                <h2>{editing.id ? 'Edit record' : c.verb}</h2>
              </div>

              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={save} className="form-grid">
              {c.fields.map(input)}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>

                <button className="button primary">
                  Save record →
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

type Dash={monthlySpending:number;monthlyBudget:number;budgetUsedPercentage:number;workoutCount:number;goalProgressPercentage:number;topExpenseCategory:string|null;categoryBreakdown:{category:string;amount:number}[];recentExpenses:Entry[];recentWorkouts:Entry[]};
function Dashboard(){const [data,setData]=useState<Dash|null>(null),[err,setErr]=useState('');useEffect(()=>{Promise.all([api.get<Dash>('/dashboard').then(r=>r.data),entries.list('expenses').then(x=>x.slice(0,5)),entries.list('workouts').then(x=>x.slice(0,5))]).then(([d,e,w])=>setData({...d,recentExpenses:d.recentExpenses||e,recentWorkouts:d.recentWorkouts||w})).catch(()=>setErr('Dashboard summary is unavailable. You can still review your records in the sections on the left.'));},[]);const month=new Date().toLocaleString('en-US',{month:'long',year:'numeric'});const cards=[['MONTHLY SPENDING',`$${data?.monthlySpending?.toFixed(2)||'0.00'}`,'This month'],['MONTHLY BUDGET',`$${data?.monthlyBudget?.toFixed(2)||'0.00'}`,'Set your monthly limit'],['BUDGET USED',`${data?.budgetUsedPercentage?.toFixed(0)||0}%`,'Of your monthly budget'],['WORKOUTS',String(data?.workoutCount||0),'Sessions this month'],['GOAL PROGRESS',`${data?.goalProgressPercentage?.toFixed(0)||0}%`,'Across active goals']];return <><PageHead eyebrow="YOUR WELLNESS AT A GLANCE" title="Overview" sub={`${month} · A little consistency goes a long way.`} action={<span className="date-chip">◷ &nbsp;{month}</span>}/>{err&&<div className="error-box mb-5">{err}</div>}<div className="stat-grid">{cards.map(([a,b,c],i)=><div className="stat-card" key={a}><div className="stat-top"><span>{a}</span><span className={`stat-glyph glyph-${i}`}>{['＄','▤','◉','↗','◎'][i]}</span></div><strong>{b}</strong><small>{c}</small></div>)}</div><div className="chart-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Spending by category</h2><p>How this month’s spending is distributed</p></div><span className="legend-dot">This month</span></div>{data?.categoryBreakdown?.length?<ResponsiveContainer width="100%" height={240}><BarChart data={data.categoryBreakdown}><CartesianGrid vertical={false} stroke="#edf0ee"/><XAxis dataKey="category" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="amount" fill="#23896a" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer>:<div className="chart-empty">Your category summary will appear as you log expenses.</div>}</section><section className="panel chart-panel"><div className="panel-head"><div><h2>Monthly budget</h2><p>Spending against your plan</p></div><span className="budget-icon">⌁</span></div><div className="budget-chart"><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={[{value:data?.monthlySpending||0},{value:Math.max((data?.monthlyBudget||0)-(data?.monthlySpending||0),0)}]} dataKey="value" innerRadius={69} outerRadius={88} startAngle={90} endAngle={-270} stroke="none">{[0,1].map(i=><Cell key={i} fill={i?'#e9efec':'#23896a'}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-label"><b>{data?.budgetUsedPercentage?.toFixed(0)||0}%</b><small>used</small></div></div><div className="budget-foot"><span>Spent <b>${data?.monthlySpending?.toFixed(0)||'0'}</b></span><span>Budget <b>${data?.monthlyBudget?.toFixed(0)||'0'}</b></span></div></section></div><div className="chart-grid lower-grid"><section className="panel list-panel"><div className="panel-head"><div><h2>Recent expenses</h2><p>Your latest health and fitness spending</p></div><Link to="/expenses">View all →</Link></div>{data?.recentExpenses?.length?data.recentExpenses.slice(0,4).map(e=><div className="recent-row" key={e.id}><span className="row-icon">↗</span><div><b>{e.title}</b><small>{e.category} · {e.date}</small></div><strong>${e.amount?.toFixed(2)}</strong></div>):<div className="mini-empty">No expenses logged yet.</div>}</section><section className="panel list-panel"><div className="panel-head"><div><h2>Recent workouts</h2><p>Every session counts</p></div><Link to="/workouts">View all →</Link></div>{data?.recentWorkouts?.length?data.recentWorkouts.slice(0,4).map(w=><div className="recent-row" key={w.id}><span className="row-icon activity">◉</span><div><b>{w.title}</b><small>{w.category} · {w.date}</small></div><strong>{w.durationMinutes||0} min</strong></div>):<div className="mini-empty">No workouts logged yet.</div>}</section></div></>}
function Settings(){const user=JSON.parse(localStorage.getItem('fitfinance-user')||'{}');return <><PageHead eyebrow="PREFERENCES" title="Settings" sub="Manage your account and session."/><section className="panel settings-panel"><div className="eyebrow">ACCOUNT</div><h2>{user.name||'FitFinance member'}</h2><p>{user.email}</p><button className="button secondary mt-5" onClick={()=>{localStorage.clear();location.assign('/login')}}>Sign out</button></section></>}
export default function App(){return <Routes><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/><Route path="/" element={<Guard><Shell><Navigate to="/dashboard" replace/></Shell></Guard>}/><Route path="/dashboard" element={<Guard><Shell><Dashboard/></Shell></Guard>}/>{Object.entries(cfg).map(([key])=><Route key={key} path={`/${key}`} element={<Guard><Shell><EntryPage type={key as keyof typeof cfg}/></Shell></Guard>}/>)}<Route path="/settings" element={<Guard><Shell><Settings/></Shell></Guard>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>}
