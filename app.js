
// Simple client-only demo. Data stored in localStorage.
// Models: schools -> classes -> students -> grades, attendance, messages
const LS_KEY = "edziennik_demo_v1";

function uid(prefix="id") {
  return prefix + "_" + Math.random().toString(36).slice(2,9);
}

function loadState(){ 
  const raw = localStorage.getItem(LS_KEY);
  if(raw) return JSON.parse(raw);
  // initial demo data
  const schoolId = uid('sch');
  const classId = uid('cls');
  const student1 = { id: uid('st'), name: 'Jan Kowalski', userEmail: 'jan.kowalski@szkola.pl' };
  const student2 = { id: uid('st'), name: 'Anna Nowak', userEmail: 'anna.nowak@szkola.pl' };
  const state = {
    schools: [{ id: schoolId, name: 'Szkoła Demo', classes: [{ id: classId, name: '7A', students: [student1, student2] }] }],
    grades: [],
    attendance: [],
    messages: []
  };
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  return state;
}

function saveState(s){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }

let state = loadState();
let currentUser = null;
let currentRole = null;
let currentClassId = state.schools[0].classes[0].id;
let currentStudentId = state.schools[0].classes[0].students[0].id;

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return [...document.querySelectorAll(sel)]; }

function renderUserInfo(){
  const el = $('#userInfo');
  if(!currentUser) el.innerHTML = '';
  else el.innerHTML = `<div><strong>${currentUser}</strong> — <em>${currentRole}</em></div>`;
}

function populateClassStudentSelectors(){
  const classSelect = $('#classSelect');
  const studentSelect = $('#studentSelect');
  classSelect.innerHTML='';
  studentSelect.innerHTML='';
  state.schools.forEach(s=> s.classes.forEach(c=> {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name;
    classSelect.appendChild(opt);
    if(c.id===currentClassId){
      c.students.forEach(st=> {
        const o = document.createElement('option');
        o.value = st.id; o.textContent = st.name;
        studentSelect.appendChild(o);
      });
    }
  }));
  classSelect.value = currentClassId;
  studentSelect.value = currentStudentId;
}

function renderGrades(){
  const tbody = $('#gradesTable tbody');
  tbody.innerHTML='';
  const list = state.grades.filter(g=> g.classId===currentClassId && g.studentId===currentStudentId);
  list.sort((a,b)=> new Date(b.date)-new Date(a.date));
  for(const g of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(g.date).toLocaleDateString()}</td><td>${g.subject}</td><td><strong>${g.value}</strong></td><td>${g.category}</td><td>${g.comment||''}</td>`;
    tbody.appendChild(tr);
  }
}

function renderAttendance(){
  const tbody = $('#attTable tbody');
  tbody.innerHTML='';
  const list = state.attendance.filter(a=> a.classId===currentClassId && a.studentId===currentStudentId);
  list.sort((a,b)=> new Date(b.date)-new Date(a.date));
  for(const a of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(a.date).toLocaleDateString()}</td><td>${a.lessonNo}</td><td>${a.status}</td><td>${a.by}</td>`;
    tbody.appendChild(tr);
  }
}

function renderMessages(){
  const wrap = $('#messagesList');
  wrap.innerHTML='';
  const list = state.messages.filter(m=> m.toEmail === currentUser || m.fromEmail === currentUser);
  list.sort((a,b)=> new Date(b.date)-new Date(a.date));
  for(const m of list){
    const d = new Date(m.date).toLocaleString();
    const node = document.createElement('div');
    node.className='card';
    node.style.marginTop='8px';
    node.innerHTML = `<strong>${m.subject}</strong><div class="muted">Od: ${m.fromEmail} — Do: ${m.toEmail} — ${d}</div><p>${m.body}</p>`;
    wrap.appendChild(node);
  }
}

function setRoleUI(){
  const teacherControls = $('#gradeFormWrap');
  const attControls = $('#attFormWrap');
  if(['NAU','WYC','SZK_ADM'].includes(currentRole)){
    teacherControls.classList.remove('hidden');
    attControls.classList.remove('hidden');
  } else {
    teacherControls.classList.add('hidden');
    attControls.classList.add('hidden');
  }
}

function initEvents(){
  $('#loginForm').addEventListener('submit', e=>{
    e.preventDefault();
    const email = $('#email').value.trim();
    const role = $('#role').value;
    currentUser = email || `${role.toLowerCase()}@demo`;
    currentRole = role;
    // pick first school/class/student defaults
    currentClassId = state.schools[0].classes[0].id;
    currentStudentId = state.schools[0].classes[0].students[0].id;
    $('#loginSection').classList.add('hidden');
    $('#dashboard').classList.remove('hidden');
    renderUserInfo();
    populateClassStudentSelectors();
    renderGrades();
    renderAttendance();
    renderMessages();
    setRoleUI();
  });

  $('#logoutBtn').addEventListener('click', ()=>{
    currentUser = null; currentRole = null;
    $('#dashboard').classList.add('hidden');
    $('#loginSection').classList.remove('hidden');
    renderUserInfo();
  });

  $('#classSelect').addEventListener('change', e=>{
    currentClassId = e.target.value;
    // pick first student in class
    const cls = state.schools[0].classes.find(c=>c.id===currentClassId);
    currentStudentId = cls.students[0].id;
    populateClassStudentSelectors();
    renderGrades(); renderAttendance();
  });

  $('#studentSelect').addEventListener('change', e=>{
    currentStudentId = e.target.value;
    renderGrades(); renderAttendance();
  });

  $all('.tab').forEach(t=> t.addEventListener('click', e=>{
    $all('.tab').forEach(x=>x.classList.remove('active'));
    e.target.classList.add('active');
    const tab = e.target.dataset.tab;
    $all('.panel').forEach(p=>p.classList.add('hidden'));
    $('#'+tab).classList.remove('hidden');
  }));

  $('#addGradeBtn').addEventListener('click', ()=>{
    const subject = $('#gSubject').value || 'Przedmiot';
    const value = $('#gValue').value || '5';
    const category = $('#gCategory').value || 'sprawdzian';
    const comment = $('#gComment').value || '';
    const g = { id: uid('g'), classId: currentClassId, studentId: currentStudentId, subject, value, category, comment, date: new Date().toISOString(), by: currentUser };
    state.grades.push(g);
    saveState(state);
    renderGrades();
    $('#gSubject').value='';$('#gValue').value='';$('#gCategory').value='';$('#gComment').value='';
  });

  $('#addAttBtn').addEventListener('click', ()=>{
    const date = $('#attDate').value || new Date().toISOString().slice(0,10);
    const lessonNo = $('#attLesson').value || '1';
    const status = $('#attStatus').value || 'P';
    const a = { id: uid('a'), classId: currentClassId, studentId: currentStudentId, date, lessonNo, status, by: currentUser };
    state.attendance.push(a);
    saveState(state);
    renderAttendance();
  });

  $('#sendMsgBtn').addEventListener('click', ()=>{
    const to = $('#msgTo').value || '';
    const subject = $('#msgSubj').value || '(bez tematu)';
    const body = $('#msgBody').value || '';
    const m = { id: uid('m'), fromEmail: currentUser, toEmail: to, subject, body, date: new Date().toISOString() };
    state.messages.push(m);
    saveState(state);
    renderMessages();
    $('#msgTo').value='';$('#msgSubj').value='';$('#msgBody').value='';
  });

  // PWA registration
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  initEvents();
  renderUserInfo();
  populateClassStudentSelectors();
  renderGrades();
  renderAttendance();
  renderMessages();
});
