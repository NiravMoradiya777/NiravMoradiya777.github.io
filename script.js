/* --- BOOT SEQUENCE --- */
window.onload = function() {
    updateClock();
    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        boot.style.opacity = '0';
        setTimeout(() => boot.style.display = 'none', 1000);
    }, 2500);
    
    // Setup CLI Listener
    const input = document.getElementById('cli-input');
    input.addEventListener('keydown', function(e) {
        if(e.key === 'Enter') handleCommand(this.value);
    });
};

/* --- WINDOW MANAGER --- */
let zIndex = 100;
let activeWindow = null;

function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'flex';
    setTimeout(() => { win.style.transform = 'scale(1)'; win.style.opacity = '1'; }, 10);
    bringToFront(win);
    addToTaskbar(id);
    if(id === 'window-skills') document.getElementById('cli-input').focus();
}

function closeWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'none';
    removeFromTaskbar(id);
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    win.style.transform = 'scale(0.8) translateY(300px)';
    win.style.opacity = '0';
    setTimeout(() => win.style.display = 'none', 300);
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if(win.style.width === '100%') {
        win.style.width = '600px'; win.style.height = '450px'; win.style.top = '10%'; win.style.left = '20%';
    } else {
        win.style.width = '100%'; win.style.height = 'calc(100vh - 40px)'; win.style.top = '0'; win.style.left = '0';
    }
}

function bringToFront(win) {
    zIndex++;
    win.style.zIndex = zIndex;
    activeWindow = win;
    document.querySelectorAll('.tray-item').forEach(i => i.classList.remove('active'));
    const tbItem = document.getElementById('tb-' + win.id);
    if(tbItem) tbItem.classList.add('active');
}

/* --- EMAIL LOGIC --- */
function sendEmail() {
    const subject = document.getElementById('mail-subject').value;
    const body = document.getElementById('mail-body').value;
    const from = document.getElementById('mail-from').value;
    const btn = document.querySelector('.mail-toolbar button');

    if(!subject || !body || !from) {
        alert("Please fill in all fields.");
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        from_name: from,
        to_name: "Nirav",
        subject: subject,
        message: body,
        reply_to: from
    })
    .then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
            closeWindow('window-mail');
            document.getElementById('mail-body').value = "";
        }, 2000);
    })
    .catch((err) => {
        btn.innerHTML = 'Error';
        alert("Email Error: " + JSON.stringify(err));
    });
}

/* --- CLI LOGIC --- */
function handleCommand(cmd) {
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('cli-input');
    
    output.innerHTML += `<div>C:\\Users\\Nirav> ${cmd}</div>`;
    cmd = cmd.toLowerCase().trim();
    let response = "";
    
    if(cmd === 'help') {
        response = "Available: <br> - list: Skills database <br> - scan: Diagnostic <br> - contact: Email <br> - clear: Clear";
    } else if (cmd === 'list') {
        response = `SKILLS DATABASE: <br>
        * Languages: C#, VB.NET, ASP.NET, WPF, WinForms <br>
        * Database: SQL Server, T-SQL, SSIS, SSRS <br>
        * Web: HTML, CSS, Bootstrap, Hangfire, IIS <br>
        * Practices: Agile/Scrum, TDD, CI/CD <br>
        * Architecture: OOP, Design Patterns, Multi-tier <br>
        * Tools: VS 2022, Azure, Git, Dapper`;
    } else if (cmd === 'scan') {
        response = "Initializing scan...";
        setTimeout(runSkillsGraphic, 500);
    } else if (cmd === 'contact') {
        openWindow('window-mail');
        response = "Opening mail client...";
    } else if (cmd === 'clear') {
        output.innerHTML = ""; input.value = ""; return;
    } else {
        response = "Unknown command.";
    }
    
    output.innerHTML += `<div style="color:#aaa; margin-bottom:10px;">${response}</div>`;
    input.value = "";
    output.scrollTop = output.scrollHeight;
}

function runSkillsGraphic() {
    const output = document.getElementById('terminal-output');
    const steps = ["Checking .NET Core Runtime...", "Verifying SQL Connections...", "Analyzing Azure Deployments...", "System 100% Operational."];
    let i = 0;
    const interval = setInterval(() => {
        if(i >= steps.length) clearInterval(interval);
        else {
            output.innerHTML += `<div style="color:#00ff00;">> ${steps[i]}</div>`;
            output.scrollTop = output.scrollHeight;
            i++;
        }
    }, 600);
}

/* --- TASKBAR & DRAG --- */
function addToTaskbar(id) {
    const tray = document.getElementById('taskbar-tray');
    if(document.getElementById('tb-' + id)) return;
    const title = document.querySelector(`#${id} .title-text`).innerText;
    const item = document.createElement('div');
    item.id = 'tb-' + id;
    item.className = 'tray-item active';
    item.innerText = title;
    item.onclick = () => {
        const win = document.getElementById(id);
        if(win.style.display === 'none') openWindow(id);
        else bringToFront(win);
    };
    tray.appendChild(item);
}
function removeFromTaskbar(id) {
    const item = document.getElementById('tb-' + id);
    if(item) item.remove();
}

document.querySelectorAll('.window').forEach(win => {
    const titleBar = win.querySelector('.title-bar');
    win.addEventListener('mousedown', () => bringToFront(win));
    titleBar.addEventListener('mousedown', (e) => {
        let shiftX = e.clientX - win.getBoundingClientRect().left;
        let shiftY = e.clientY - win.getBoundingClientRect().top;
        function moveAt(pageX, pageY) {
            win.style.left = pageX - shiftX + 'px';
            win.style.top = pageY - shiftY + 'px';
        }
        function onMouseMove(event) { moveAt(event.pageX, event.pageY); }
        document.addEventListener('mousemove', onMouseMove);
        titleBar.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            titleBar.onmouseup = null;
        };
    });
});

function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimeout(updateClock, 1000);
}