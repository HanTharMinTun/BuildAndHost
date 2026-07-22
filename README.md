````markdown
# BuildAndHost

AI-powered website builder that generates websites from JSON using:

- React + Vite (Frontend)
- Python (Backend/API)
- Groq API (AI generation)

---

# Requirements

Install these before starting:

- Git
- Node.js LTS
- npm
- Python 3.10+
- VS Code (recommended)

---

# 1. Clone Repository (Everyone)

Open Terminal / PowerShell and run:

```bash
git clone https://github.com/HanTharMinTun/BuildAndHost.git
````

Enter the project:

```bash
cd BuildAndHost
```

---

# 🪟 Windows Setup

Follow all steps in this section.

---

## Step 1: Install Git

Download Git:

[https://git-scm.com/downloads](https://git-scm.com/downloads)

After installation, verify:

```powershell
git --version
```

---

## Step 2: Install Node.js (Recommended)

1. Download **NVM for Windows**:

[https://github.com/coreybutler/nvm-windows/releases
](https://github.com/coreybutler/nvm-windows/releases/download/1.2.2/nvm-setup.exe)

2. Install NVM using the installer.
   

4. Install the required Node.js version (replace with your version):

```powershell
nvm install 22.14.0
```

4. Use that version:

```powershell
nvm use 22.14.0
```

5. Verify:

```powershell
node -v
npm -v
```

Expected output:

```text
v22.14.0
```
```

---

## Step 3: Install Python

Download Python:

[https://www.python.org/downloads/](https://www.python.org/downloads/)

During installation:

```
☑ Add Python to PATH
```

Verify:

```powershell
python --version
pip --version
```

---

## Step 4: Install Frontend

Go to frontend folder:

```powershell
cd ai-website-builder
```

Install packages:

```powershell
npm install
```
Expected node version v22.14.0


Start React:

```powershell
npm run dev
```

Open browser:

```
http://localhost:5173
``` 
When the server is working, shutdown the server again with q+Enter in terminal!
---

## Step 5: Setup Python Backend

Open a new terminal.

Go back:

```powershell
cd ..
```

Enter backend:

```powershell
cd backend
```

Create virtual environment:

```powershell
python -m venv .venv
```

Activate:

```powershell
.venv\Scripts\activate
```

Install packages:

```powershell
pip install -r requirements.txt
```

---


## Step 6: Generate Website

Run:

```powershell
python generate.py
```

This creates:

```
generated_website.json
```

---

## Step 8: Run Website

Open another terminal:

```powershell
cd ai-website-builder
```

Run:

```powershell
npm run dev
```

Your website is ready.

---

<br>

# 🐧 Linux Setup (Ubuntu/Debian)

Follow all steps in this section.

---

## Step 1: Install Git

```bash
sudo apt update
sudo apt install git
```

Verify:

```bash
git --version
```

---

## Step 2: Install Node.js using NVM

Install NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Restart terminal.

Check:

```bash
nvm --version
```

Install Node LTS:

```bash
nvm install
nvm use
```

Verify:

```bash
node -v
npm -v
```
Expected node version v22.14.0

---

## Step 3: Install Python

```bash
sudo apt install python3 python3-pip python3-venv
```

Verify:

```bash
python3 --version
pip3 --version
```

---

## Step 4: Install Frontend

Go to frontend:

```bash
cd ai-website-builder
```

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## Step 5: Setup Backend

Open another terminal.

Go to backend:

```bash
cd ../backend
```

Create virtual environment:

```bash
python3 -m venv .venv
```

Activate:

```bash
source .venv/bin/activate
```

Install packages:

```bash
pip install -r requirements.txt
```

---


## Step 6: Generate Website

Run:

```bash
python3 generate.py
```

---

## Step 8: Run Frontend

```bash
cd ../ai-website-builder
```

Run:

```bash
npm run dev
```

---

<br>

# 🍎 macOS Setup

Follow all steps in this section.

---

## Step 1: Install Homebrew

Open Terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## Step 2: Install Required Software

```bash
brew install git

brew install nvm

mkdir -p ~/.nvm

echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix nvm)/nvm.sh" ] && source "$(brew --prefix nvm)/nvm.sh"' >> ~/.zshrc

source ~/.zshrc

nvm install 22.16.0
nvm use 22.16.0
nvm alias default 22.16.0

node -v

brew install python
```

Verify:

```bash
git --version
node -v
npm -v
python3 --version
```

---

## Step 3: Install Frontend

Go to frontend:

```bash
cd ai-website-builder
```

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## Step 4: Setup Backend

Open another terminal.

Go to backend:

```bash
cd ../backend
```

Create environment:

```bash
python3 -m venv .venv
```

Activate:

```bash
source .venv/bin/activate
```

Install packages:

```bash
pip install -r requirements.txt
```

---

## Step 5: Generate Website

```bash
python3 generate.py
```

---

## Step 6: Run Frontend

```bash
cd ../ai-website-builder
```

Run:

```bash
npm run dev
```

---

# Project Structure

```
BuildAndHost/

│
├── ai-website-builder/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── generate.py
│   ├── requirements.txt
│   └── .env
│
├── generated_website.json
│
└── README.md
```
