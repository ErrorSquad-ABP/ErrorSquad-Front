<div align="center">
  <h1>
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=30&duration=3000&pause=1000&color=4A90E2&center=true&vCenter=true&repeat=true&width=1000&lines=Interface+Web+de+Hor%C3%A1rios+Acad%C3%AAmicos+%7C+Frontend+%F0%9F%92%BB" alt="Typing SVG" />
  </h1>

  <div style="display: flex; justify-content: center; align-items: center; gap: 50px;">
    <a href="https://www.cps.sp.gov.br/">
      <img src="https://raw.githubusercontent.com/ErrorSquad-ABP/ErrorSquad-Assets1/main/Images/CPS-removebg-preview.png" height="90" alt="Logo CPS"/>
    </a>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a href="https://fatecjacarei.cps.sp.gov.br/">
      <img src="https://raw.githubusercontent.com/ErrorSquad-ABP/ErrorSquad-Assets1/main/Images/Fatec-removebg-preview.png" height="90" alt="Logo Fatec"/>
    </a>
  </div>

  <br>
  
  <div>
    <img src="https://img.shields.io/badge/Projeto-ABP_2025.1-blue?style=for-the-badge"/>
    <img src="https://img.shields.io/badge/Curso-1º_DSM-green?style=for-the-badge"/>
    <img src="https://img.shields.io/badge/Sprint-1_concluída-success?style=for-the-badge&logo=clockify&logoColor=white"/>
    <img src="https://img.shields.io/badge/Interface-Responsiva-4a90e2?style=for-the-badge&logo=figma&logoColor=white"/>
    <img src="https://img.shields.io/badge/Status-Funcional-success?style=for-the-badge"/>
  </div>
</div>

## 📱 Visão Geral

Interface web responsiva para visualização de horários acadêmicos da FATEC Jacareí. Desenvolvida seguindo o conceito Mobile First, com foco em usabilidade e experiência do usuário.

### 🎯 Objetivo
Desenvolver um sistema web para que a comunidade acadêmica possa consultar os horários das aulas por curso, ambiente, turno (diurno e noturno) e turma (ex. 1DSM, 2DSM, 1Geo).

### ⚡ Requisitos Funcionais
- **RF01:** Ingestão de dados a partir de arquivo CSV
- **RF02:** Gerenciamento de dados (CRUD) via interface
- **RF03:** Validação de regras de alocação
- **RF04:** Exportação de relatórios em PDF
- **RF05:** Consultas dinâmicas (turma/turno/professor)

### 🎨 Requisitos Não Funcionais
- **RNF01:** Mapa interativo de salas com visualização por turno
- **RNF02:** Design responsivo e consistente em todos os dispositivos

### 📋 Restrições de Projeto
- Prototipação e validação no Figma
- HTML, CSS e JavaScript para frontend
- PostgreSQL para banco de dados
- JavaScript para servidor
- Documentação no GitHub
- Trello para gestão de tarefas

## ⚙️ Stack Frontend

### Tecnologias Core
- **HTML5** - Estruturação semântica do conteúdo
- **CSS3** - Estilização e responsividade
- **JavaScript** - Lógica e interatividade
- **Express** - Servidor de desenvolvimento

### UI/UX
- **Figma** - Prototipação e design system
- **Mobile First** - Metodologia de desenvolvimento
- **Responsividade** - Breakpoints adaptativos

### DevTools
- **Git/GitHub** - Versionamento de código
- **Trello** - Gestão ágil (Scrum)
- **VS Code** - Ambiente de desenvolvimento

## 📁 Estrutura do Projeto

```
frontend/
├── assets/
│   ├── css/      # Estilos e temas
│   ├── fonts/    # Fontes personalizadas
│   ├── img/      # Imagens e ícones
│   ├── js/       # Scripts JavaScript
│   └── vendors/  # Bibliotecas externas
├── pages/
│   ├── mapa.html         # Visualização do mapa
│   ├── dashboard.html    # Painel principal
│   ├── grade.html        # Grade de horários
│   ├── login.html        # Autenticação
│   └── ...              # Outras páginas
├── config/              # Configurações
├── includes/           # Componentes reutilizáveis
└── index.html          # Página inicial
```

## 📅 Cronograma

| Data | Evento |
|------|---------|
| 18/03/2025 | Kick-off (20h00) |
| 18/03/2025 | Data limite para apresentação da planilha de avaliação |
| 24/03/2025 | Início da Sprint 1 |
| 14/04/2025 | Envio do vídeo da Review Sprint 1 |
| 15/04/2025 | Review da Sprint 1 |
| 16/04/2025 | Início da Sprint 2 |
| 14/05/2025 | Envio do vídeo da Review Sprint 2 |
| 15/05/2025 | Review da Sprint 2 |
| 16/05/2025 | Início da Sprint 3 |
| 09/06/2025 | Envio do vídeo da Review Sprint 3 |
| 10/06/2025 | Review da Sprint 3 |
| 11/06/2025 | Apresentação final do projeto |

## 📥 Como Executar o Projeto

### Pré-requisitos

- **Node.js**: [Baixe aqui](https://nodejs.org/)
- **Git**: [Baixe aqui](https://git-scm.com/)
- **Editor de Código**: Recomendado [Visual Studio Code](https://code.visualstudio.com/)

### Passos para Execução

```bash
# Clone o repositório
git clone https://github.com/ErrorSquad-ABP/error-squad-front.git

# Entre na pasta do projeto
cd error-squad-front

# Instale as dependências
npm install express

# Inicie o servidor de desenvolvimento
npm start
```

---

## 👥 Nossa Equipe

<div align="center">
    <table>
        <tr>
            <td align="center"><b>Gestão</b></td>
            <td align="center"><b>Desenvolvimento</b></td>
        </tr>
        <tr>
            <td align="center">
                <table>
                    <tr>
                        <td align="center">
                            <b>Tiago Jardel Costa</b><br>
                            <i>Product Owner</i><br>
                            <a href="https://github.com/Tiago199516">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/tiago-jardel-da-costa-0b595bba/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <b>Arthur Facchinetti Peixoto</b><br>
                            <i>Scrum Master</i><br>
                            <a href="https://github.com/ArthurFacchinetti">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/arthur-facchinetti-peixoto/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
            <td align="center">
                <table>
                    <tr>
                        <td align="center">
                            <b>João Victor Lopes Rosa</b><br>
                            <a href="https://github.com/JV-L0pes">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/arthur-facchinetti-peixoto/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                        <td align="center">
                            <b>Alícia Silva Dias</b><br>
                            <a href="https://github.com/TIALICIA">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/alícia-silva-dias/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <b>Leonardo da Silva Irineu</b><br>
                            <a href="https://github.com/Leo-Slv">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/leonardo-irineu-8418b0288/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                        <td align="center">
                            <b>Felipe Ferreira Pacheco</b><br>
                            <a href="https://github.com/FelipePacheco30">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/felipe-ferreira-pacheco-621443347/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <b>Carlos Eduardo Espirito Santo</b><br>
                            <a href="https://github.com/PromptdComando">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/carlos-eduardo-espirito-santo/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                        <td align="center">
                            <b>Caio Araujo</b><br>
                            <a href="https://github.com/Caiuuutecnologico">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/caio-arauj/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>

---

## 👨‍🏫 Coordenação e Orientação

<div align="center">
    <table>
        <tr>
            <td align="center"><b>Professor</b></td>
        </tr>
        <tr>
            <td align="center">
                <table>
                    <tr>
                        <td align="center">
                            <b>Prof. Marcelo Sudo</b><br>
                            <i>Focal Point</i><br>
                            <a href="https://github.com/marcelosudo">
                                <img src="https://img.shields.io/badge/GitHub-333?style=flat-square&logo=github"/>
                            </a>
                            <a href="https://www.linkedin.com/in/marcelo-sudo/">
                                <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>

---

<br>

## 📜 Licença

<div align="center">
    <a href="https://github.com/ErrorSquad-ABP/ErrorSquadABP/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/📄_Licença-MIT-4a90e2?style=for-the-badge"/>
    </a>
</div>

<div align="center">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=4a90e2&height=100&section=footer" width="100%"/>
</div>
