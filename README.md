# Malebolge Command Center

**Gerent | Push | Limbo | In_telectus**

Plataforma open source de operações de cibersegurança ofensiva — laboratório de testes, simulação de ataques e pesquisa de segurança.

---

## 📊 Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| Frontend | HTMX 1.9 + JavaScript (Vanilla) |
| Estilo | CSS3 com Design System próprio (variáveis CSS) |
| Backend | .NET 8 (4 microserviços) |
| Cache | Redis (StackExchange.Redis) |
| Mensageria | Orleans (Microsoft Orleans) |
| Banco | Oracle Autonomous (Free Tier) - rainbow_low |
| Autenticação | JWT + 2FA via Email |
| Infra | Docker Compose / Nginx |
| Imagens | jammy (acesso ao shell para debug) |

---

## 🧩 Módulos do Sistema

| Módulo | Nome | Porta | Cor | Função |
| :--- | :--- | :--- | :--- | :--- |
| **Gerent** | Comando | 10001 | Azul (#6ba4d6) | SIEM, Assets, Vulns, Incidentes |
| **Push** | Força | 10002 | Vermelho (#d97a7a) | Pentest, Scans, Exploits |
| **Limbo** | Caos | 10003 | Púrpura (#a89dd4) | Laboratórios efêmeros, Destruição |
| **In_telectus** | Process. | 10004 | Cinza (#b8bdc4) | Orquestração IA, Workflows, Obsidian |

---

## 🏛️ Arquitetura de Redes
```text
                                                              +--------------------------------------------+
                                                              |              Cloudflare Tunnel             |
                                                              |            rapsodia.th1eros.dev            |
                                                              +--------------------+-----------------------+
                                                                                   |
                                                                             +-----v-----+
                                                                             |   Nginx   | (Porta 8081)
                                                                             |  Frontend |
                                                                             +-----+-----+
                                                                                   |
                                                                     +-------------+-------------+
                                                                     |             |             |
                                                               +-----v-----+ +-----v-----+ +-----v-----+
                                                               |  Gerent   | |   Push    | |   Limbo   |
                                                               |   10001   | |   10002   | |   10003   |
                                                               +-----+-----+ +-----+-----+ +-----+-----+
                                                                     |             |             |
                                                                     +-------------+-------------+
                                                                                   |
                                                                             +-----v-----+
                                                                             |In_telectus|
                                                                             |   10004   |
                                                                             +-----------+
```
--- 

## ⚡ Instalação e Execução

### Pré-requisitos
* Docker / Docker Compose
* Git

# Clonar o repositório central de infraestrutura
git clone [https://github.com/ab1tat/rapsodia.git](https://github.com/ab1tat/rapsodia.git)
cd rapsodia

# Garantir a branch de desenvolvimento do ecossistema
git checkout develop

# Inicializar o ecossistema sob o namespace isolado
docker compose -p malebolge up -d

Acesso Local: https://rapsodia.th1eros.dev (via túnel configurado) ou através do gateway do Nginx na porta 8081.

## 🛠️Funcionalidades Principais

| Módulo | Recursos Operacionais Disponíveis |
| :--- | :--- |
| **Gerent (Blue)** | - Dashboard analítico com grid expansível via duplo clique<br>- Operações de CRUD completas para Assets, Vulnerabilidades e Incidentes<br>- Grafo de topologia de rede dinâmico com suporte a redimensionamento<br>- Central de Health Check e gerenciamento granular de permissões |
| **Push (Red)** | - Mapeamento multi-target com persistência via localStorage<br>- Execução integrada de ferramentas (Nmap, Metasploit, Hydra)<br>- Modais customizados para parametrização de alvos e payloads<br>- Playbooks automatizados de transição sequencial: Scan -> Exploit |
| **Limbo (Violet)** | - Provisionamento dinâmico e efêmero de laboratórios isolados<br>- Mecanismo de snapshotting com exportação e importação de configs<br>- Deploy declarativo de cenários via arquivos JSON remoto no GitHub<br>- Módulos nativos de Honeypots ativos e simulações de Cyber Range |
| **In_telectus (Silver)** | - Orquestração comportamental distribuída via Orleans Multi-Agentes<br>- Workflows sequenciais: Scan, Pentest, Full Attack e AI Analysis<br>- Sincronização viva de conhecimento com Obsidian Knowledge Vault<br>- Console interativo em tempo real (Chat com IA) para análise |
```bash
