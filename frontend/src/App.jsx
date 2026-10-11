import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart3, Bell, Cake, CalendarDays, Check, ChevronDown, CircleDollarSign,
  Clock3, Coffee, CreditCard, FileText, Flame, FolderOpen, GalleryHorizontalEnd,
  Grid2X2, LayoutDashboard, Menu, Package, Pencil, Pizza, Plus, ReceiptText,
  RefreshCw, Search, Settings, ShoppingCart, Store, Tag, Trash2, Upload,
  Users, X, Utensils, WalletCards, Wallet, Truck, Banknote, Smartphone,
  Minus, Image as ImageIcon, Sparkles, Layers3, SlidersHorizontal,
  ClipboardList, Megaphone, ArrowUpRight, CircleAlert, LogIn, LogOut, LockKeyhole, Receipt
} from 'lucide-react'
import { firebaseApi, isAdmin, observeAuth, signIn, signOutUser, uploadImage } from './firebase'

const logo = '/jeff-bistro-admin-logo.jpeg'
const API = 'Firebase Firestore'

const COLORS = { red: '#E50914', deepRed: '#B00020', gold: '#FFCC19', orange: '#FF8C00', charcoal: '#111111', bg: '#FFFDF9' }

const money = value => `KSh ${Number(value || 0).toLocaleString('en-KE')}`
const uid = prefix => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const demo = {
  categories: [
    { id: 'cat_fast_food', name: 'Foods', description: 'Burgers, wings and fast food', displayOrder: 1 },
    { id: 'cat_fries', name: 'Chips & Fries', description: 'Loaded fries and sides', displayOrder: 2 },
    { id: 'cat_bakery', name: 'Bakery & Cakes', description: 'Fresh bakery and celebration cakes', displayOrder: 3 },
    { id: 'cat_pizza', name: 'Pizzas', description: 'Fresh oven-baked pizzas', displayOrder: 4 },
    { id: 'cat_drinks', name: 'Drinks', description: 'Cold drinks, coffee and juices', displayOrder: 5 },
    { id: 'cat_deals', name: 'Deals', description: 'Value combos and specials', displayOrder: 6 }
  ],
  products: [
    { id:'p1', name:"Jeff's Signature Monster Smash Burger", categoryId:'cat_fast_food', price:850, description:'Double smashed beef, cheddar, bacon and bistro sauce.', imageUrl:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80' },
    { id:'p2', name:'Loaded Cheesy Fries', categoryId:'cat_fries', price:550, description:'Crispy fries with cheese and signature sauce.', imageUrl:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80' },
    { id:'p3', name:'Triple Chocolate Fudge Cake', categoryId:'cat_bakery', price:2800, description:'Triple-layer chocolate sponge and ganache.', imageUrl:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80' },
    { id:'p4', name:'Chicken Tikka Supreme Pizza', categoryId:'cat_pizza', price:950, description:'Chicken tikka, peppers, onion and mozzarella.', imageUrl:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80' },
    { id:'p5', name:'Golden Butter Croissant', categoryId:'cat_bakery', price:350, description:'Fresh flaky French butter croissant.', imageUrl:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80' },
    { id:'p6', name:'Passion Fruit Cooler', categoryId:'cat_drinks', price:300, description:'Fresh passion fruit cooler.', imageUrl:'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80' }
  ],
  flavors: ['Belgian Dark Chocolate','Vanilla Bean','Red Velvet','Black Forest'].map((name,i)=>({id:`f${i}`,name})),
  shapes: ['Round Classic','Square','Heart','Multi-Tier'].map((name,i)=>({id:`s${i}`,name})),
  sizes: [{id:'z1',name:'1 Kg',price:2500},{id:'z2',name:'2 Kg',price:4500},{id:'z3',name:'3 Kg',price:6500}],
  toppings: ['Extra Mozzarella','Grilled Chicken Tikka','Fresh Mushrooms','Crispy Bacon'].map((name,i)=>({id:`t${i}`,name,price:0})),
  gallery: [
    {id:'g1',title:'Celebration Cakes',category:'Cakes',imageUrl:'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80',description:'Custom celebration cake showcase'},
    {id:'g2',title:'Chicken Tikka Pizza',category:'Pizzas',imageUrl:'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',description:'Fresh pizza from the bistro oven'}
  ],
  promotions: [
    {id:'promo1',title:'20% OFF Custom Cakes',description:'Celebrate for less with custom cakes.',discountCode:'CAKE20',discountPercentage:20,bannerImageUrl:'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80',expiryDate:'Limited time',isActive:true},
    {id:'promo2',title:'Pizza + Fries + Drink',description:'Combo special for the weekend.',discountCode:'PIZZACOMBO',discountPercentage:15,bannerImageUrl:'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',expiryDate:'Weekend special',isActive:true}
  ],
  settings: { whatsappNumber:'+254712345678', bannerAnnouncement:'🔥 Fresh out of the oven — hot deals all day!', operatingHours:'Mon - Sun: 8:00 AM - 11:00 PM', deliveryFee:200, isStoreOpen:true },
  orders: [],
  expenses: []
}

const emptyData = {
  ...demo,
  categories: [],
  products: [],
  flavors: [],
  shapes: [],
  sizes: [],
  toppings: [],
  gallery: [],
  promotions: [],
  orders: [],
  expenses: []
}

const nav = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'pos',label:'Cashier POS',icon:ShoppingCart,accent:true},
  {id:'orders',label:'Orders',icon:ClipboardList},
  {id:'expenses',label:'Expenses',icon:Receipt},
  {id:'products',label:'Menu Products',icon:Package},
  {id:'categories',label:'Categories',icon:Layers3},
  {id:'cake-options',label:'Cake Options',icon:Cake},
  {id:'toppings',label:'Pizza Toppings',icon:Pizza},
  {id:'gallery',label:'Gallery',icon:GalleryHorizontalEnd},
  {id:'promotions',label:'Hot Deals',icon:Flame},
  {id:'settings',label:'Store Settings',icon:Settings}
]

function App(){
  const [authUser,setAuthUser]=useState(null)
  const [adminUser,setAdminUser]=useState(null)
  const [authLoading,setAuthLoading]=useState(true)
  const [authError,setAuthError]=useState('')
  const [active,setActive]=useState('dashboard')
  const [collapsed,setCollapsed]=useState(false)
  const [mobileOpen,setMobileOpen]=useState(false)
  const [data,setData]=useState(emptyData)
  const [apiOnline,setApiOnline]=useState(true)
  const [toast,setToast]=useState(null)

  useEffect(()=>observeAuth(async user=>{
    setAuthLoading(false)
    if(!user){
      setAuthUser(null)
      setAdminUser(null)
      return
    }
    try{
      if(!await isAdmin(user)){
        await signOutUser()
        setAuthError('This Firebase account is not authorized to manage the store.')
        return
      }
      setAuthError('')
      setAuthUser(user)
      setAdminUser(user)
      setApiOnline(true)
    }catch(error){
      setApiOnline(false)
      setAuthError(error.message||'Could not verify Firebase admin access.')
    }
  }),[])

  useEffect(()=>{ if(authUser) loadAll() },[authUser])

  async function logout(){
    try{
      await signOutUser()
      setAuthUser(null)
      setAdminUser(null)
      setData(emptyData)
      setActive('dashboard')
    }catch(error){
      notify(error.message||'Could not sign out of Firebase.','error')
    }
  }

  async function login(email,password){
    setAuthError('')
    const credential=await signIn(email.trim(),password)
    if(!await isAdmin(credential.user)){
      await signOutUser()
      throw new Error('This Firebase account is not authorized to manage the store.')
    }
  }

  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(null),3200); return ()=>clearTimeout(t)},[toast])

  async function loadAll(){
    const endpoints = {
      categories:'/api/categories',products:'/api/products',flavors:'/api/cake-options/flavors',shapes:'/api/cake-options/shapes',sizes:'/api/cake-options/sizes',
      toppings:'/api/pizza-toppings',gallery:'/api/gallery',promotions:'/api/promotions',orders:'/api/orders',expenses:'/api/expenses',settings:'/api/settings'
    }
    try {
      const entries = await Promise.all(Object.entries(endpoints).map(async ([key,path])=>{
        return [key,await firebaseApi(path)]
      }))
      const loadedData=Object.fromEntries(entries)
      setData(prev => ({ ...prev, ...loadedData, settings: loadedData.settings || demo.settings }))
      setApiOnline(true)
    } catch(error) {
      setApiOnline(false)
      setData(emptyData)
      notify(error.message||'Could not load store data from Firebase.','error')
    }
  }

  const saveLocal = (key, value) => setData(prev=>({...prev,[key]:value}))
  const notify=(message,type='success')=>setToast({message,type})

  async function api(path,options={}){
    try{
      const result=await firebaseApi(path,options)
      setApiOnline(true)
      return result
    }catch(error){
      setApiOnline(false)
      throw error
    }
  }

  async function createEntity(key,path,payload){
    const created=await api(path,{method:'POST',body:JSON.stringify(payload)},()=>({...payload,id:payload.id||uid(key)}))
    saveLocal(key,[created,...(data[key]||[])])
    return created
  }
  async function removeEntity(key,path,id){
    await api(`${path}/${id}`,{method:'DELETE'},()=>({ok:true}))
    saveLocal(key,(data[key]||[]).filter(x=>x.id!==id))
  }

  const categoryName=id => data.categories.find(c=>c.id===id)?.name || 'Uncategorised'
  const page = useMemo(()=>nav.find(n=>n.id===active),[active])

  if(authLoading) return <div className="login-screen"><div className="login-card">Connecting to Firebase...</div></div>
  if(!authUser) return <LoginPage onLogin={login} authError={authError}/>

  return <div className={`app ${collapsed?'nav-collapsed':''}`}>
    <aside className={`sidebar ${mobileOpen?'mobile-open':''}`}>
      <div className="brand-lockup">
        <img src={logo} alt="Jeff Bistro Admin" />
        <div className="brand-copy"><strong>JEFF BISTRO</strong><span>FAST FOOD & BAKERY</span></div>
      </div>
      <div className="nav-label">MANAGEMENT</div>
      <nav>{nav.map(item=>{
        const Icon=item.icon
        return <button key={item.id} className={`nav-item ${active===item.id?'active':''} ${item.accent?'pos-nav':''}`} onClick={()=>{setActive(item.id);setMobileOpen(false)}} title={item.label}>
          <Icon size={19}/><span>{item.label}</span>{item.accent&&<span className="nav-hot">LIVE</span>}
        </button>
      })}</nav>
      <div className="sidebar-bottom">
        <div className={`connection ${apiOnline?'online':'offline'}`}><span className="dot"/><span>{apiOnline?'Firebase Connected':'Firebase Offline'}</span></div>
        <button className="collapse-btn" onClick={()=>setCollapsed(v=>!v)}><SlidersHorizontal size={17}/><span>{collapsed?'Expand':'Collapse'} menu</span></button>
        <button className="collapse-btn logout-btn" onClick={logout}><LogOut size={17}/><span>Log out</span></button>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMobileOpen(v=>!v)}><Menu/></button>
        <div className="top-brand"><img src={logo} alt="Jeff Bistro"/><div><strong>JEFF BISTRO</strong><span>FAST FOOD & BAKERY</span></div></div>
        <div className="top-title"><div className="eyebrow">ADMIN / {page?.label?.toUpperCase()}</div><h1>{page?.label}</h1></div>
        <div className="top-actions">
          <div className="today-sales"><CircleDollarSign size={18}/><div><small>Today's Sales</small><strong>{money(salesToday(data.orders))}</strong></div></div>
          <div className="avatar" title={adminUser?.email||'Admin'}>JB</div>
        </div>
      </header>
      <div className="content">
        {active==='dashboard' && <Dashboard data={data} setActive={setActive}/>}
        {active==='pos' && <POS data={data} saveLocal={saveLocal} api={api} notify={notify} categoryName={categoryName}/>}
        {active==='orders' && <Orders data={data} saveLocal={saveLocal} api={api} notify={notify} />}
        {active==='expenses' && <Expenses data={data} saveLocal={saveLocal} api={api} notify={notify} />}
        {active==='products' && <Products data={data} createEntity={createEntity} removeEntity={removeEntity} notify={notify} categoryName={categoryName}/>}
        {active==='categories' && <Categories data={data} createEntity={createEntity} removeEntity={removeEntity} saveLocal={saveLocal} api={api} notify={notify}/>}
        {active==='cake-options' && <CakeOptions data={data} createEntity={createEntity} removeEntity={removeEntity} notify={notify}/>}
        {active==='toppings' && <Toppings data={data} createEntity={createEntity} removeEntity={removeEntity} notify={notify}/>}
        {active==='gallery' && <Gallery data={data} createEntity={createEntity} removeEntity={removeEntity} notify={notify}/>}
        {active==='promotions' && <Promotions data={data} createEntity={createEntity} removeEntity={removeEntity} notify={notify}/>}
        {active==='settings' && <SettingsPage data={data} saveLocal={saveLocal} api={api} notify={notify}/>}
      </div>
    </main>
    {toast&&<div className={`toast ${toast.type}`}><Check size={17}/>{toast.message}</div>}
  </div>
}

export default App

function salesToday(orders=[]){
  const today=new Date().toDateString()
  return orders.filter(o=>new Date(o.createdAt||o.updatedAt||Date.now()).toDateString()===today).reduce((s,o)=>s+Number(o.totalAmount||0),0)
}
function todaysOrders(orders=[]){ const today=new Date().toDateString(); return orders.filter(o=>new Date(o.createdAt||o.updatedAt||Date.now()).toDateString()===today) }
function statOrders(orders=[]){ return todaysOrders(orders).length }
function salesByPayment(orders,method){return todaysOrders(orders).filter(o=>o.paymentMethod===method).reduce((s,o)=>s+Number(o.totalAmount||0),0)}
function expensesToday(expenses=[]){ const today=new Date().toDateString(); return expenses.filter(e=>new Date(e.expenseDate||e.createdAt||Date.now()).toDateString()===today).reduce((s,e)=>s+Number(e.amount||0),0) }

function Dashboard({data,setActive}){
  const today= todaysOrders(data.orders)
  const stats=[
    {label:'Total Sales Today',value:money(salesToday(data.orders)),icon:Wallet,delta:'Gross sales',tone:'red'},
    {label:'Cash Sales',value:money(salesByPayment(data.orders,'Cash')),icon:Banknote,delta:'Live',tone:'gold'},
    {label:'M-Pesa Sales',value:money(salesByPayment(data.orders,'M-Pesa')),icon:Smartphone,delta:'Live',tone:'green'},
    {label:'Orders Today',value:statOrders(data.orders),icon:ReceiptText,delta:`${data.orders.length} all time`,tone:'orange'},
    {label:'Expenses Today',value:money(expensesToday(data.expenses)),icon:Receipt,delta:'Cash expenses',tone:'orange'},
    {label:'Sales After Expenses',value:money(salesToday(data.orders)-expensesToday(data.expenses)),icon:WalletCards,delta:'Sales − recorded expenses',tone:'green'}
  ]
  const recent=[...data.orders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6)
  return <div className="page-stack">
    <div className="hero-banner"><div><div className="hero-kicker"><Sparkles size={15}/> CONTROL CENTER</div><h2>Good service starts with good systems.</h2><p>Run the till, menu, orders, promotions and store settings from one clean workspace.</p></div><button className="primary-btn" onClick={()=>setActive('pos')}><ShoppingCart size={18}/> Open Cashier</button></div>
    <div className="stat-grid">{stats.map(s=>{const Icon=s.icon;return <div className="stat-card" key={s.label}><div className={`stat-icon ${s.tone}`}><Icon size={21}/></div><div><span>{s.label}</span><strong>{s.value}</strong><small>{s.delta}</small></div></div>})}</div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-head"><div><span className="section-kicker">OPERATIONS</span><h3>Recent orders</h3></div><button className="ghost-btn" onClick={()=>setActive('orders')}>View all <ArrowUpRight size={16}/></button></div>
        {recent.length===0?<Empty icon={ReceiptText} text="No orders yet. Completed POS sales will appear here."/>:<div className="order-table">{recent.map(o=><div className="order-row" key={o.id}><div><strong>#{o.id}</strong><span>{o.customerName||'Walk-in'} · {o.orderType||'App'}</span></div><div><span className={`status ${String(o.status||'PENDING').toLowerCase()}`}>{o.status||'PENDING'}</span></div><strong>{money(o.totalAmount)}</strong></div>)}</div>}
      </section>
      <section className="panel quick-panel"><div className="panel-head"><div><span className="section-kicker">QUICK ACTIONS</span><h3>Manager shortcuts</h3></div></div><div className="quick-grid">
        <Quick icon={ShoppingCart} label="New POS sale" onClick={()=>setActive('pos')}/><Quick icon={Package} label="Add product" onClick={()=>setActive('products')}/><Quick icon={Flame} label="Create deal" onClick={()=>setActive('promotions')}/><Quick icon={Receipt} label="Record expense" onClick={()=>setActive('expenses')}/><Quick icon={Settings} label="Store settings" onClick={()=>setActive('settings')}/>
      </div><div className="announcement"><Megaphone size={18}/><div><strong>{data.settings?.bannerAnnouncement||'No store announcement'}</strong><span>{data.settings?.operatingHours||'Operating hours not configured'}</span></div></div></section>
    </div>
  </div>
}
function Quick({icon:Icon,label,onClick}){return <button className="quick-action" onClick={onClick}><Icon size={21}/><span>{label}</span><ArrowUpRight size={15}/></button>}

function POS({data,saveLocal,api,notify,categoryName}){
  const [category,setCategory]=useState('All')
  const [query,setQuery]=useState('')
  const [cart,setCart]=useState([])
  const [orderType,setOrderType]=useState('Walk-in')
  const [table,setTable]=useState('')
  const [payment,setPayment]=useState('Cash')
  const [cash,setCash]=useState('')
  const [busy,setBusy]=useState(false)
  const categories=['All','Foods','Chips & Fries','Bakery & Cakes','Pizzas','Drinks','Deals']
  const filtered=data.products.filter(p=>{
    const cat=categoryName(p.categoryId)
    const categoryMatch=category==='All'||cat.toLowerCase().includes(category.toLowerCase().replace(' & ',' ').split(' ')[0])|| (category==='Foods'&&/food|burger|chicken|fries/i.test(cat+' '+p.name))
    return categoryMatch && p.name.toLowerCase().includes(query.toLowerCase())
  })
  const subtotal=cart.reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.qty)||0),0)
  const total=subtotal
  const cashReceived=payment==='Cash' ? (Number(cash)||0) : 0
  const change=Math.max(0,cashReceived-total)
  function add(p){setCart(c=>{const found=c.find(i=>i.id===p.id);return found?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]})}
  function adjust(id,d){setCart(c=>c.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0))}
  function resetSale(){setCart([]);setOrderType('Walk-in');setTable('');setPayment('Cash');setCash('')}
  async function complete(){
    if(!cart.length) return notify('Add at least one item to the sale','error')
    if(payment==='Cash' && cashReceived<total) return notify('Cash received is less than the sale total','error')
    if(orderType==='Dine-in' && !table.trim()) return notify('Enter a table number for dine-in','error')
    setBusy(true)
    const now=new Date().toISOString()
    const payload={
      id:uid('POS'), customerName:'Walk-in Customer', customerPhone:'',
      deliveryAddress:orderType==='Dine-in'?`Table ${table}`:'In-store',
      items:cart.map(i=>({productId:i.id,name:i.name,quantity:Number(i.qty),price:Number(i.price),total:Number(i.price)*Number(i.qty)})),
      subtotal,totalAmount:total,discount:0,deliveryFee:0,isWhatsAppOrder:false,
      orderType,tableNumber:orderType==='Dine-in'?table:'',paymentMethod:payment,
      cashTendered:payment==='Cash'?cashReceived:0, changeGiven:payment==='Cash'?change:0,
      source:'POS',status:'COMPLETED',createdAt:now
    }
    try {
      const created=await api('/api/orders',{method:'POST',body:JSON.stringify(payload)},()=>payload)
      saveLocal('orders',[created,...data.orders])
      notify(`${payment} sale recorded — ${money(total)}`)
      resetSale()
    } catch { notify('Could not record the sale','error') }
    setBusy(false)
  }
  return <div className="pos-layout">
    <section className="pos-menu panel">
      <div className="pos-toolbar"><div><span className="section-kicker">CASHIER</span><h2>Start a sale</h2><p className="field-note">Tap products to add them to the current sale.</p></div><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search menu..."/></div></div>
      <div className="category-pills">{categories.map(c=><button key={c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <div className="product-grid">{filtered.map(p=><button className="product-card" key={p.id} onClick={()=>add(p)}><div className="product-image"><img src={p.imageUrl||logo} alt=""/><span>{categoryName(p.categoryId)}</span></div><div className="product-info"><strong>{p.name}</strong><div><b>{money(p.price)}</b><Plus size={17}/></div></div></button>)}{!filtered.length&&<Empty icon={Search} text="No menu items match that filter."/>}</div>
    </section>
    <aside className="pos-cart panel"><div className="cart-head"><div><span className="section-kicker">CURRENT SALE</span><h3>Sale ticket</h3></div><span className="cart-count">{cart.reduce((s,i)=>s+i.qty,0)} items</span></div>
      <div className="cart-items">{cart.length===0?<Empty icon={ShoppingCart} text="Start a sale by tapping a menu item."/>:cart.map(i=><div className="cart-item" key={i.id}><img src={i.imageUrl||logo} alt=""/><div className="cart-item-main"><strong>{i.name}</strong><span>{money(i.price)} each</span><div className="qty"><button type="button" onClick={()=>adjust(i.id,-1)}><Minus size={13}/></button><b>{i.qty}</b><button type="button" onClick={()=>adjust(i.id,1)}><Plus size={13}/></button></div></div><div className="line-total"><strong>{money(i.price*i.qty)}</strong><button type="button" onClick={()=>adjust(i.id,-i.qty)}><Trash2 size={14}/></button></div></div>)}</div>
      <div className="checkout"><div className="form-grid two"><label>Order type<div className="segmented"><button type="button" className={orderType==='Walk-in'?'on':''} onClick={()=>setOrderType('Walk-in')}>Walk-in / Takeaway</button><button type="button" className={orderType==='Dine-in'?'on':''} onClick={()=>setOrderType('Dine-in')}>Dine-in</button></div></label>{orderType==='Dine-in'&&<label>Table #<input value={table} onChange={e=>setTable(e.target.value)} placeholder="e.g. 4"/></label>}</div>
        <label>Payment method<div className="payment-tabs"><button type="button" className={payment==='Cash'?'on':''} onClick={()=>setPayment('Cash')}><Banknote size={16}/>Cash</button><button type="button" className={payment==='M-Pesa'?'on':''} onClick={()=>setPayment('M-Pesa')}><Smartphone size={16}/>M-Pesa</button></div></label>
        {payment==='Cash'&&<div className="form-grid two"><label>Cash Received (KSh)<input type="number" min="0" step="0.01" value={cash} onChange={e=>setCash(e.target.value)} placeholder="0"/></label><label>Change (KSh)<input className="readonly" value={money(change).replace('KSh ','')} readOnly/></label></div>}
        {payment==='M-Pesa'&&<div className="payment-note"><Smartphone size={16}/><span>Record this sale as <strong>M-Pesa</strong>. No STK push and no transaction code is required.</span></div>}
        <div className="total-line"><span>Sale total</span><strong>{money(total)}</strong></div>
        <button className="complete-btn" disabled={busy} onClick={complete}>{busy?<RefreshCw className="spin" size={18}/>:<Check size={18}/>} {busy?'Recording...':'RECORD SALE'}</button>
      </div>
    </aside>
  </div>
}

function Expenses({data,saveLocal,api,notify}){
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState({title:'',amount:'',note:''})
  const today=expensesToday(data.expenses)
  async function add(e){
    e.preventDefault()
    if(!form.title.trim()||Number(form.amount)<=0) return notify('Enter an expense name and a positive amount','error')
    const payload={id:uid('EXP'),title:form.title.trim(),amount:Number(form.amount),note:form.note.trim(),expenseDate:new Date().toISOString()}
    try{
      const created=await api('/api/expenses',{method:'POST',body:JSON.stringify(payload)},()=>payload)
      saveLocal('expenses',[created,...data.expenses]); setForm({title:'',amount:'',note:''}); setOpen(false); notify('Expense recorded')
    }catch{notify('Could not save expense','error')}
  }
  async function remove(id){try{await api(`/api/expenses/${id}`,{method:'DELETE'},()=>({ok:true}));saveLocal('expenses',data.expenses.filter(e=>e.id!==id));notify('Expense deleted')}catch{notify('Could not delete expense','error')}}
  return <div className="page-stack">
    <div className="page-head"><div><span className="section-kicker">CASH CONTROL</span><h2>Expenses</h2><p>Record every business expense. No categories — just the actual amount spent.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Plus size={17}/> Add Expense</button></div>
    <div className="stat-grid expense-stats"><div className="stat-card"><div className="stat-icon orange"><Receipt size={21}/></div><div><span>Expenses Today</span><strong>{money(today)}</strong><small>Total recorded today</small></div></div><div className="stat-card"><div className="stat-icon red"><WalletCards size={21}/></div><div><span>Sales After Expenses</span><strong>{money(salesToday(data.orders)-today)}</strong><small>Sales − recorded expenses</small></div></div></div>
    <div className="list-panel">{data.expenses.length===0?<Empty icon={Receipt} text="No expenses recorded yet."/>:[...data.expenses].sort((a,b)=>new Date(b.expenseDate||b.createdAt)-new Date(a.expenseDate||a.createdAt)).map(e=><div className="manager-row" key={e.id}><div className="manager-icon orange"><Receipt size={19}/></div><div className="manager-main"><strong>{e.title}</strong><span>{e.note||'Business expense'}</span></div><span className="order-pill">{new Date(e.expenseDate||e.createdAt).toLocaleDateString('en-KE')}</span><strong className="expense-amount">{money(e.amount)}</strong><button className="icon-btn danger" onClick={()=>remove(e.id)}><Trash2 size={16}/></button></div>)}</div>
    {open&&<Modal title="Record Expense" onClose={()=>setOpen(false)}><form className="modal-form" onSubmit={add}><label>Expense Name<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Flour purchase, electricity, rent" autoFocus/></label><label>Amount (KSh)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0"/></label><label>Note (optional)<textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Optional details"/></label><button className="primary-btn full" type="submit"><Check size={17}/> SAVE EXPENSE</button></form></Modal>}
  </div>
}

function Products({data,createEntity,removeEntity,notify,categoryName}){
  const [open,setOpen]=useState(false); const [query,setQuery]=useState(''); const [form,setForm]=useState({name:'',categoryId:data.categories[0]?.id||'',price:'',description:'',imageUrl:''});
  const items=data.products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase()))
  async function submit(e){e.preventDefault();if(!form.name||!form.price||!form.imageUrl)return notify('Name, price and image are required','error');try{await createEntity('products','/api/products',{...form,id:uid('p'),price:Number(form.price)});setOpen(false);setForm({name:'',categoryId:data.categories[0]?.id||'',price:'',description:'',imageUrl:''});notify('Product added')}catch{notify('Could not add product','error')}}
  return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">MENU CATALOGUE</span><h2>Products</h2><p>Manage the menu items available at this register.</p></div><div className="head-actions"><div className="searchbox compact"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products"/></div><button className="primary-btn" onClick={()=>setOpen(true)}><Upload size={17}/> Upload Product</button></div></div>
    <div className="catalog-grid">{items.map(p=><div className="catalog-card" key={p.id}><div className="catalog-img"><img src={p.imageUrl||logo} alt=""/><span>{categoryName(p.categoryId)}</span></div><div className="catalog-body"><h3>{p.name}</h3><p>{p.description||'No description added.'}</p><div className="catalog-footer"><strong>{money(p.price)}</strong><button className="danger-btn" onClick={async()=>{await removeEntity('products','/api/products',p.id);notify('Product deleted')}}><Trash2 size={15}/> Delete</button></div></div></div>)}{!items.length&&<Empty icon={Package} text="No products found."/>}</div>
    {open&&<Modal title="Upload Product" onClose={()=>setOpen(false)}><form onSubmit={submit} className="modal-form"><label>Product Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Loaded Chicken Burger"/></label><label>Category<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{data.categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Price (KSh)<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="850"/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short menu description"/></label><ImageInput value={form.imageUrl} onChange={v=>setForm({...form,imageUrl:v})}/><button className="primary-btn full" type="submit"><Plus size={17}/> Add Product</button></form></Modal>}
  </div>
}

function Categories({data,createEntity,removeEntity,saveLocal,api,notify}){
 const [open,setOpen]=useState(false);const [edit,setEdit]=useState(null);const [form,setForm]=useState({name:'',description:''})
 async function submit(e){e.preventDefault();if(!form.name)return;try{if(edit){const updated=await api(`/api/categories/${edit.id}`,{method:'PUT',body:JSON.stringify({...edit,...form})},()=>({...edit,...form}));saveLocal('categories',data.categories.map(c=>c.id===edit.id?updated:c));notify('Category updated')}else{await createEntity('categories','/api/categories',{id:uid('cat'),name:form.name,description:form.description,iconName:'RestaurantMenu',displayOrder:data.categories.length+1});notify('Category added')}setOpen(false);setEdit(null);setForm({name:'',description:''})}catch{notify('Could not save category','error')}}
 return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">MENU STRUCTURE</span><h2>Categories</h2><p>Keep your menu organised for the app and POS.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Plus size={17}/> Add Category</button></div><div className="list-panel">{data.categories.map(c=><div className="manager-row" key={c.id}><div className="manager-icon orange"><Utensils size={19}/></div><div className="manager-main"><strong>{c.name}</strong><span>{c.description||'No description'}</span></div><span className="order-pill">#{c.displayOrder||'-'}</span><button className="icon-btn" onClick={()=>{setEdit(c);setForm({name:c.name,description:c.description||''});setOpen(true)}}><Pencil size={16}/></button><button className="icon-btn danger" onClick={async()=>{await removeEntity('categories','/api/categories',c.id);notify('Category deleted')}}><Trash2 size={16}/></button></div>)}</div>{open&&<Modal title={edit?'Edit Category':'Add Category'} onClose={()=>{setOpen(false);setEdit(null)}}><form className="modal-form" onSubmit={submit}><label>Category Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Foods"/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button className="primary-btn full" type="submit"><Check size={17}/>{edit?'Save Changes':'Add Category'}</button></form></Modal>}</div>
}

function CakeOptions({data,createEntity,removeEntity,notify}){
 const [modal,setModal]=useState(null);const [value,setValue]=useState('');const [price,setPrice]=useState('')
 const add=async()=>{if(!value)return;if(modal==='flavors')await createEntity('flavors','/api/cake-options/flavors',{id:uid('flavor'),name:value});if(modal==='shapes')await createEntity('shapes','/api/cake-options/shapes',{id:uid('shape'),name:value});if(modal==='sizes')await createEntity('sizes','/api/cake-options/sizes',{id:uid('size'),name:value,price:Number(price||0)});setModal(null);setValue('');setPrice('');notify('Cake option added')}
 const section=(title,key,items,icon,withPrice=false)=><section className="panel option-panel"><div className="panel-head"><div><span className="section-kicker">CAKE BUILDER</span><h3>{title}</h3></div><button className="secondary-btn" onClick={()=>setModal(key)}><Plus size={16}/> Add {withPrice?'Size & Price':title.slice(0,-1)}</button></div><div className="chip-list">{items.map(i=><div className="option-chip" key={i.id}><span>{i.name}</span>{withPrice&&<b>{money(i.price)}</b>}<button onClick={async()=>{await removeEntity(key,'/api/cake-options/'+key,i.id);notify('Option deleted')}}><X size={14}/></button></div>)}</div></section>
 return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">CUSTOM CAKES</span><h2>Cake Customizer</h2><p>Manage the choices customers see when building custom cakes.</p></div></div><div className="three-panels">{section('Cake Flavors','flavors',data.flavors,Cake,true)}{section('Cake Shapes','shapes',data.shapes,Cake,true)}{section('Cake Sizes & Prices','sizes',data.sizes,Cake,true)}</div>{modal&&<Modal title={`Add ${modal==='sizes'?'Cake Size & Price':modal==='flavors'?'Cake Flavor':'Cake Shape'}`} onClose={()=>setModal(null)}><div className="modal-form"><label>Name<input value={value} onChange={e=>setValue(e.target.value)} placeholder={modal==='sizes'?'1 Kg':'e.g. Vanilla Bean'}/></label>{modal==='sizes'&&<label>Price (KSh)<input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="2500"/></label>}<button className="primary-btn full" onClick={add}><Plus size={17}/> Add</button></div></Modal>}</div>
}

function Toppings({data,createEntity,removeEntity,notify}){const [open,setOpen]=useState(false);const [value,setValue]=useState('');return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">PIZZA BUILDER</span><h2>Pizza Toppings</h2><p>Names only — pricing can stay controlled by the pizza product.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Plus size={17}/> Add Topping</button></div><div className="list-panel">{data.toppings.map(t=><div className="manager-row" key={t.id}><div className="manager-icon red"><Pizza size={19}/></div><div className="manager-main"><strong>{t.name}</strong><span>Available for pizza customisation</span></div><button className="icon-btn danger" onClick={async()=>{await removeEntity('toppings','/api/pizza-toppings',t.id);notify('Topping deleted')}}><Trash2 size={16}/></button></div>)}</div>{open&&<Modal title="Add Pizza Topping" onClose={()=>setOpen(false)}><div className="modal-form"><label>Topping Name<input value={value} onChange={e=>setValue(e.target.value)} placeholder="e.g. Grilled Chicken Tikka"/></label><button className="primary-btn full" onClick={async()=>{if(!value)return;await createEntity('toppings','/api/pizza-toppings',{id:uid('top'),name:value,price:0});setValue('');setOpen(false);notify('Topping added')}}><Plus size={17}/> Add Topping</button></div></Modal>}</div>}

function Gallery({data,createEntity,removeEntity,notify}){const [open,setOpen]=useState(false);const [form,setForm]=useState({title:'',category:'Showcase',imageUrl:'',description:''});return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">VISUAL MERCHANDISING</span><h2>Gallery Showcase</h2><p>Upload high-resolution photos for your customer-facing showcase.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Upload size={17}/> Upload Photo</button></div><div className="gallery-grid">{data.gallery.map(g=><div className="gallery-card" key={g.id}><img src={g.imageUrl||logo} alt=""/><div className="gallery-overlay"><span>{g.category}</span><strong>{g.title}</strong><button onClick={async()=>{await removeEntity('gallery','/api/gallery',g.id);notify('Photo deleted')}}><Trash2 size={16}/></button></div></div>)}</div>{open&&<Modal title="Upload Showcase Photo" onClose={()=>setOpen(false)}><form className="modal-form" onSubmit={async e=>{e.preventDefault();if(!form.title||!form.imageUrl)return notify('Title and image are required','error');await createEntity('gallery','/api/gallery',{id:uid('g'),...form});setOpen(false);setForm({title:'',category:'Showcase',imageUrl:'',description:''});notify('Photo added')}}><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><ImageInput value={form.imageUrl} onChange={v=>setForm({...form,imageUrl:v})}/><button className="primary-btn full"><Upload size={17}/> Add Photo</button></form></Modal>}</div>}

function Promotions({data,createEntity,removeEntity,notify}){const [open,setOpen]=useState(false);const [form,setForm]=useState({title:'',description:'',discountCode:'',discountPercentage:'',bannerImageUrl:'',expiryDate:'Limited time'});return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">MARKETING</span><h2>Hot Deals & Promotions</h2><p>Publish limited-time offers and promotional banners.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Flame size={17}/> Create Hot Deal</button></div><div className="promo-grid">{data.promotions.map(p=><div className="promo-card" key={p.id}><img src={p.bannerImageUrl||logo} alt=""/><div className="promo-badge">-{p.discountPercentage}%</div><div className="promo-body"><span>{p.discountCode} · {p.expiryDate}</span><h3>{p.title}</h3><p>{p.description}</p><button className="danger-btn" onClick={async()=>{await removeEntity('promotions','/api/promotions',p.id);notify('Promotion deleted')}}><Trash2 size={15}/> Delete</button></div></div>)}</div>{open&&<Modal title="Create Hot Deal" onClose={()=>setOpen(false)}><form className="modal-form" onSubmit={async e=>{e.preventDefault();if(!form.title||!form.discountPercentage||!form.bannerImageUrl)return notify('Title, discount and banner are required','error');await createEntity('promotions','/api/promotions',{id:uid('promo'),...form,discountPercentage:Number(form.discountPercentage),isActive:true});setOpen(false);setForm({title:'',description:'',discountCode:'',discountPercentage:'',bannerImageUrl:'',expiryDate:'Limited time'});notify('Hot deal created')}}><label>Offer Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-grid two"><label>Discount %<input type="number" value={form.discountPercentage} onChange={e=>setForm({...form,discountPercentage:e.target.value})}/></label><label>Discount Code<input value={form.discountCode} onChange={e=>setForm({...form,discountCode:e.target.value.toUpperCase()})} placeholder="BISTRO20"/></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Expiry / Label<input value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})}/></label><ImageInput value={form.bannerImageUrl} onChange={v=>setForm({...form,bannerImageUrl:v})}/><button className="primary-btn full"><Flame size={17}/> Create Deal</button></form></Modal>}</div>}

function SettingsPage({data,saveLocal,api,notify}){const [form,setForm]=useState(data.settings||demo.settings);useEffect(()=>setForm(data.settings||demo.settings),[data.settings]);async function save(e){e.preventDefault();try{const saved=await api('/api/settings',{method:'PUT',body:JSON.stringify({...form,deliveryFee:Number(form.deliveryFee)})},()=>form);saveLocal('settings',saved);notify('Store settings saved')}catch{notify('Could not save settings','error')}}return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">CONFIGURATION</span><h2>Store Settings</h2><p>Control the information and operating details used across the store.</p></div><div className={`store-status ${form.isStoreOpen?'open':'closed'}`}><span className="dot"/>{form.isStoreOpen?'Store Open':'Store Closed'}</div></div><div className="settings-grid"><section className="panel"><div className="panel-head"><div><span className="section-kicker">STORE PROFILE</span><h3>Public settings</h3></div></div><form className="modal-form" onSubmit={save}><label>Store Announcement Banner Text<textarea value={form.bannerAnnouncement||''} onChange={e=>setForm({...form,bannerAnnouncement:e.target.value})}/></label><label>WhatsApp Phone Number<input value={form.whatsappNumber||''} onChange={e=>setForm({...form,whatsappNumber:e.target.value})} placeholder="+254712345678"/></label><label>Operating Hours<input value={form.operatingHours||''} onChange={e=>setForm({...form,operatingHours:e.target.value})}/></label><label>Standard Delivery Fee (KSh)<input type="number" value={form.deliveryFee??0} onChange={e=>setForm({...form,deliveryFee:e.target.value})}/></label><label className="toggle-row"><span><strong>Store is open</strong><small>Allow customer ordering during operating hours.</small></span><button type="button" className={`toggle ${form.isStoreOpen?'on':''}`} onClick={()=>setForm({...form,isStoreOpen:!form.isStoreOpen})}><span/></button></label><button className="primary-btn full" type="submit"><Check size={17}/> SAVE STORE SETTINGS</button></form></section><section className="panel"><div className="panel-head"><div><span className="section-kicker">TODAY</span><h3>Sales snapshot</h3></div></div><div className="sales-mini"><MiniStat label="Total Sales" value={money(salesToday(data.orders))} icon={Wallet}/><MiniStat label="Cash" value={money(salesByPayment(data.orders,'Cash'))} icon={Banknote}/><MiniStat label="M-Pesa" value={money(salesByPayment(data.orders,'M-Pesa'))} icon={Smartphone}/><MiniStat label="Orders" value={statOrders(data.orders)} icon={ReceiptText}/></div><div className="settings-note"><CircleAlert size={18}/><div><strong>API base URL</strong><span>{API}</span></div></div></section></div></div>}
function MiniStat({label,value,icon:Icon}){return <div className="mini-stat"><Icon size={18}/><span>{label}</span><strong>{value}</strong></div>}

function Orders({data,saveLocal,api,notify}){const [query,setQuery]=useState('');const filtered=data.orders.filter(o=>`${o.id} ${o.customerName} ${o.paymentMethod}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));async function update(id,status){try{const updated=await api(`/api/orders/${id}/status`,{method:'PUT',body:JSON.stringify({status})},()=>data.orders.find(o=>o.id===id));saveLocal('orders',data.orders.map(o=>o.id===id?{...o,status}:o));notify(`Order ${id} marked ${status}`)}catch{notify('Could not update order','error')}}return <div className="page-stack"><div className="page-head"><div><span className="section-kicker">FULFILMENT</span><h2>Sales</h2><p>Review POS sales and update their status.</p></div><div className="searchbox compact"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search sale..."/></div></div><div className="list-panel orders-panel">{filtered.length===0?<Empty icon={ClipboardList} text="No sales recorded yet."/>:filtered.map(o=><div className="order-manager" key={o.id}><div className="order-id"><strong>#{o.id}</strong><span>{new Date(o.createdAt||Date.now()).toLocaleString('en-KE')}</span></div><div className="order-customer"><strong>{o.customerName||'Walk-in Customer'}</strong><span>{o.orderType||'Walk-in'} · {o.paymentMethod||'Cash'}</span></div><div className="order-items"><span>{(o.items||[]).length} item line(s)</span><small>{o.source==='POS'?'POS sale':'Sale'}</small></div><strong className="order-amount">{money(o.totalAmount)}</strong><select value={o.status||'PENDING'} onChange={e=>update(o.id,e.target.value)}><option>PENDING</option><option>CONFIRMED</option><option>PREPARING</option><option>OUT_FOR_DELIVERY</option><option>COMPLETED</option></select></div>)}</div></div>}

function ImageInput({value,onChange}){const [mode,setMode]=useState('url');const [uploading,setUploading]=useState(false);const [error,setError]=useState('');async function file(e){const f=e.target.files?.[0];if(!f)return;setUploading(true);setError('');try{onChange(await uploadImage(f))}catch(err){setError(err.message||'Could not upload image to Firebase Storage.')}finally{setUploading(false)}}return <div className="image-input"><div className="image-tabs"><button type="button" className={mode==='url'?'on':''} onClick={()=>setMode('url')}>Image URL</button><button type="button" className={mode==='file'?'on':''} onClick={()=>setMode('file')}>Upload File</button></div>{mode==='url'?<input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="https://..."/>:<input type="file" accept="image/*" onChange={file}/>} {uploading&&<small style={{color:'#888'}}>Uploading image...</small>}{error&&<small className="login-error">{error}</small>}{value&&<div className="image-preview"><img src={value} alt="Preview"/></div>}</div>}
function Modal({title,onClose,children}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
function LoginPage({onLogin,authError}){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState(authError||'')
  useEffect(()=>setError(authError||''),[authError])
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{await onLogin(email,password)}catch(err){setError(err.message||'Login failed')}finally{setBusy(false)}}
  return <div className="login-screen"><div className="login-card"><img src={logo} alt="Jeff Bistro POS"/><div className="login-heading"><span>JEFF BISTRO</span><h1>POS Login</h1><p>Sales, menu, expenses & store management.</p></div><form onSubmit={submit}><label>Admin Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></label><label>Password<input autoComplete="current-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter admin password"/></label>{error&&<div className="login-error"><CircleAlert size={16}/>{error}</div>}<button className="complete-btn login-btn" disabled={busy}>{busy?<RefreshCw className="spin" size={18}/>:<LockKeyhole size={18}/>} {busy?'Signing in...':'SIGN IN TO POS'}</button></form><small className="login-note">Use an administrator account created in Firebase Authentication.</small></div></div>
}

function Empty({icon:Icon,text}){return <div className="empty"><Icon size={28}/><span>{text}</span></div>}
