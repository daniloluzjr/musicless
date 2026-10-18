# Recon: app de prática musical com IA (referência: Moises)

> Etapa `/replica-recon` · 18 out 2026 · Fontes: apenas páginas públicas (site, página de funcionalidades, página do Studio, artigo oficial de funcionalidades, centro de ajuda, listagens de terceiros para preços).
> Sem capturas de ecrã e sem conta: os ecrãs são **inferidos** a partir de descrições públicas e dos guias do centro de ajuda. Confiança: A = descrito explicitamente, M = descrito em termos gerais, B = inferido.
> Regime clean-room: descreve **o que o produto faz**, por palavras nossas. Não copia código, modelos de IA, textos, marca nem conteúdos (vozes, presets, bibliotecas).

---

## 1. O que é

App B2C para músicos. O utilizador carrega uma música e a IA separa-a em pistas (stems). Depois pode praticar por cima: silenciar o seu instrumento, abrandar, mudar o tom, ver acordes e letra, ou fazer loop de uma secção.

Hoje há duas camadas:

| Camada | Para quê | Plataformas |
|---|---|---|
| **App Moises (prática)** | separar, praticar, gravar vídeo, setlists, masterizar | web, desktop, iPhone, iPad, Android |
| **Moises Studio (criação)** | DAW no browser com colaboração em tempo real, geração de stems, conversão de voz | web, desktop |
| Plugin para DAW | separação dentro do Logic / Ableton / etc. | VST (Pro) |

Modelo de negócio: freemium com subscrição. Free, Premium e Pro, mensal ou anual, pago também pelas lojas de apps. A tabela de preços completa só aparece com login. Valores de terceiros divergem (ex.: Premium ~$4–6/mês ou $39.99/ano; Pro entre $9.99 e $29.99/mês conforme fonte e loja), por isso **confirmar no próprio site antes da fase `/replica-launch`**.

Escala declarada: dezenas de milhões de utilizadores. Prémios Apple / Google / Microsoft.

---

## 2. Planos e limites (as regras que definem o paywall)

| Capacidade | Free | Premium | Pro | Conf. |
|---|---|---|---|---|
| Uploads por mês | 5 | ilimitado | ilimitado | A |
| Tipos de separação | 2: voz + instrumental · voz/bateria/baixo/outros | combinações com mais instrumentos | todos + modelos exclusivos | A |
| Separação personalizada | não | até 6 pistas por upload (incl. "Outros") | ilimitada | A |
| Qualidade Hi-Fi | não | não | sim | A |
| Modelo multimédia (diálogo / música / efeitos) | não | não | sim | A |
| Modelo de partes da bateria (bombo, tarola, tímbalos, pratos…) | não | não | sim | A |
| Velocidade e tom | sim | sim | sim | A |
| Count-in | até 4 cliques | até 16 | até 16 | A |
| Secções da música (loop) | limitado | ilimitado | ilimitado | A |
| Transcrição de letra com deteção automática de idioma | não | sim | sim | A |
| Sugestões do escritor de letras | limitadas | ilimitadas | ilimitadas | A |
| Masterização | processa | (fontes divergem) | processa + exporta | M |
| Plugin para DAW | não | não | sim | A |
| Conversão de voz | não | não | sim | A |
| Upload em massa (até 20 ficheiros, web/desktop) | sim, gasta créditos | sim | sim | A |

---

## 3. Módulos

1. **Upload e biblioteca**: ficheiro do dispositivo, upload em massa, pesquisa, renomear, apagar, offload do dispositivo.
2. **Separação de pistas (stems)**: predefinições por plano, separação personalizada por instrumento, grupos com variantes (guitarras combinadas / acústica + elétrica / ritmo + solo; voz combinada / principal + coros), o resto vai para "Outros". Dezenas de tipos de stems no total.
3. **Leitor de prática (núcleo)**: mixer por stem (volume, mute, solo), velocidade sem mudar o tom, tom sem mudar a velocidade, loop A-B, trim.
4. **Análise musical**: BPM, tonalidade, grelha de compassos e tempos, acordes sincronizados com 3 níveis de dificuldade, modo capo para guitarra, secções (verso, refrão, ponte).
5. **Metrónomo inteligente**: click sincronizado com a música que acompanha a mudança de velocidade, mais count-in configurável.
6. **Letra**: transcrição automática sincronizada, mais de 30 idiomas, vista combinada de acordes e letra.
7. **Setlists colaborativas**: organizar músicas, partilhar com banda ou alunos, sincronização em tempo real entre dispositivos.
8. **Gravação de vídeo**: gravar por cima da música com áudio e vídeo sincronizados, rever, exportar para redes sociais.
9. **Masterização**: com faixa de referência, exportação em WAV / FLAC / MP3, escolha de bit depth e sample rate.
10. **Escritor de letras**: sugestões de rimas e versos.
11. **Conversão de voz**: mudar o timbre de uma voz mantendo afinação e fraseado, com biblioteca de vozes ou modelo próprio.
12. **Studio (DAW colaborativa)**: multipista, gravação com takes e comping, edição e automação, histórico de versões, marcadores, geração de stems e samples por prompt, áudio para MIDI, instrumentos, efeitos, auto-mix por género, masterização num clique, colaboração por link com cursores e comentários, funcionamento offline com sincronização, exportação para formatos de DAW.
13. **Plugin para DAW**: separação dentro da DAW com drag & drop.
14. **Conta e subscrição**: perfil com competências e objetivos, predefinição de separação, atalhos de teclado, paywall, gestão de plano.

---

## 4. Ecrãs (inferidos)

### 4.1 App de prática (web/desktop/mobile partilham estrutura)

| # | Ecrã | Elementos principais | Conf. |
|---|---|---|---|
| S1 | Registo / login | email, login social | M |
| S2 | Onboarding | instrumento(s), competências, objetivos | A |
| S3 | Biblioteca | lista de músicas, pesquisa, botão "+ Novo", menu de opções por música | A |
| S4 | Upload: escolher ficheiro(s) | seletor, upload em massa (web/desktop) | A |
| S5 | Upload: escolher ferramenta | separação (por defeito), masterização, etc. | A |
| S6 | Upload: tipo de separação | predefinições por plano + "personalizada" com grelha de instrumentos e variantes, contador de pistas; opções bloqueadas mostram cadeado | A |
| S7 | Processamento | estado da tarefa, progresso | M |
| S8 | **Leitor / mixer** | forma de onda + timeline; faixa por stem com volume / mute / solo / esquerda-direita; transporte; controlo de velocidade; controlo de tom; tonalidade e BPM; metrónomo + count-in; secções clicáveis; loop A-B; trim | A |
| S9 | Painel de acordes | acordes sincronizados, nível fácil / médio / avançado, compassos e tempos, modo capo | A |
| S10 | Painel de letra | letra sincronizada, idioma, vista combinada acordes + letra | A |
| S11 | Opções da música | renomear, adicionar a setlist, mudar separação, repetir, exportar, apagar | A |
| S12 | Exportar | stems individuais ou mistura, formato | M |
| S13 | Setlists | lista, criar | A |
| S14 | Detalhe da setlist | músicas, ordem, membros, convidar / partilhar | A |
| S15 | Gravação de vídeo | câmara, gravar por cima da música, rever, partilhar | A |
| S16 | Masterização | carregar faixa + referência, pré-ouvir, definições de exportação | A |
| S17 | Escritor de letras | editor, sugestões | A |
| S18 | Perfil / definições | separação por defeito, competências, objetivos, atalhos, idioma | A |
| S19 | Paywall / planos | comparação de planos, mensal / anual | A |
| S20 | Gerir subscrição | plano atual, renovação, cancelar | M |

### 4.2 Studio (fora do MVP, ver §10)

| # | Ecrã | Conf. |
|---|---|---|
| T1 | Lista de sessões | A |
| T2 | Editor multipista (pistas, timeline, mixer, efeitos, automação, marcadores) | A |
| T3 | Painel de geração (stems / samples por prompt ou por correspondência) | A |
| T4 | Partilha da sessão (link, colaboradores, comentários) | A |
| T5 | Histórico de versões | A |

**Total: 25 ecrãs** (20 na app de prática, 5 no Studio).

---

## 5. Fluxos

**F1. Primeira utilização**
Registo → onboarding (instrumento, objetivos) → biblioteca vazia → "+ Novo" → escolher ficheiro → tipo de separação → submeter → processamento → abrir no leitor.

**F2. Praticar uma parte**
Abrir música → silenciar o stem do próprio instrumento (ou isolar o que quer aprender) → abrandar → ligar metrónomo + count-in → escolher secção ou loop A-B → ler acordes / letra → repetir.

**F3. Transpor para a voz**
Leitor → ver tonalidade detetada → mudar tom em meios-tons → acordes acompanham a nova tonalidade → opcional: modo capo.

**F4. Mudar a separação**
Opções da música → mudar separação → nova tarefa de processamento → no plano Free consome um dos uploads do mês.

**F5. Ensaio com a banda**
Criar setlist → adicionar músicas → convidar membros → todos veem as mesmas músicas e alterações em tempo real em qualquer dispositivo.

**F6. Gravar e partilhar**
Leitor → gravação de vídeo → gravar por cima da música → rever → exportar / partilhar.

**F7. Masterizar**
Carregar faixa → carregar referência → processar → ouvir antes/depois → exportar com formato, bit depth e sample rate (exportação só no plano adequado).

**F8. Upgrade**
Utilizador bate num limite (6.º upload no mês, separação bloqueada, count-in > 4) → paywall → subscrever (web ou loja) → funcionalidade desbloqueada de imediato.

**F9. Upload em massa**
Web/desktop → "+ Novo" → selecionar até 20 ficheiros → um único tipo de separação para todos → submeter → cada ficheiro gera uma tarefa.

---

## 6. Regras de negócio

| ID | Regra | Conf. |
|---|---|---|
| RN01 | Free: máximo 5 uploads por mês civil; contador visível. | A |
| RN02 | Free: só 2 predefinições de separação. | A |
| RN03 | Separação personalizada: os instrumentos não escolhidos vão para uma pista "Outros". Premium: máx. 6 pistas incluindo "Outros". Pro: sem limite. | A |
| RN04 | Mudar a separação de uma música já processada cria nova tarefa e, no Free, gasta um upload. | A |
| RN05 | Upload em massa: até 20 ficheiros, todos com a mesma separação. Só web/desktop. Não disponível para masterização. Free gasta créditos por ficheiro. | A |
| RN06 | Velocidade e tom são independentes entre si e gratuitos. | A |
| RN07 | O metrónomo segue a grelha de tempos da música e acompanha a mudança de velocidade. | A |
| RN08 | Count-in: até 4 cliques no Free, até 16 nos planos pagos. | A |
| RN09 | Acordes têm 3 níveis de simplificação e alinham com compassos e tempos. | A |
| RN10 | Alterar o tom transpõe os acordes mostrados. | M (inferido) |
| RN11 | Alterações a uma setlist partilhada sincronizam de imediato para todos os membros. | A |
| RN12 | Masterização: todos podem processar, só os planos superiores exportam. Exportação permite WAV / FLAC / MP3, bit depth e sample rate. | A |
| RN13 | Funcionalidades pagas aparecem bloqueadas (não escondidas) e levam ao paywall. | B |
| RN14 | O áudio do utilizador nunca é usado para treinar modelos partilhados. | A |
| RN15 | Colaboradores entram numa sessão do Studio por link sem precisar de plano pago. | A |
| RN16 | Estado do leitor (volumes dos stems, velocidade, tom, loop) é guardado por utilizador e por música. | B |

---

## 7. Modelo de dados (inferido)

```
User ── profile (instrumentos, competências, objetivos, separação_por_defeito)
  ├─ Subscription (plano: free/premium/pro, período, origem: web/app_store/play, estado, renova_em)
  └─ UsageCounter (mês, uploads_usados)  ← RN01

Track (owner, título, ficheiro_original, duração, formato, criado_em)
  ├─ ProcessingJob[] (tipo: separation/analysis/lyrics/mastering, opções, modelo, qualidade, estado, erro, custo_em_créditos)
  ├─ Stem[] (job_id, instrumento, variante, ficheiro, qualidade)
  ├─ Analysis (bpm, tonalidade, beat_grid[], chords[] {início, fim, acorde, nível}, sections[] {início, fim, rótulo})
  ├─ Lyrics (idioma, linhas[] {início, fim, texto})
  ├─ PlayerState (por utilizador: volume/mute/solo por stem, velocidade, semitons, loop, count_in, volume_click)
  ├─ Recording[] (vídeo/áudio, offset, criado_em)
  └─ MasteringResult[] (referência_track_id, ficheiro, formato, bit_depth, sample_rate)

SeparationPreset (nome, instrumentos[], plano_mínimo)
InstrumentCatalog (id, grupo, variantes[], plano_mínimo, hi_fi_disponível)

Setlist (owner, nome) 1─n SetlistItem (track_id, ordem) ; SetlistMember (user, papel)
LyricDraft (user, texto, sugestões[])
Entitlement (plano → capacidades e limites)  ← fonte única para o paywall
```

Entidades principais: **17**. A peça crítica é a **fila de processamento com GPU** (ProcessingJob). É ela que define custo, latência e margem.

---

## 8. Fora de âmbito (é deles, não é funcionalidade)

- **Os modelos de IA treinados** (separação Hi-Fi, acordes, voz) e os dados licenciados com que foram treinados. No clone usam-se modelos com licença comercial compatível. **Verificar a licença de cada modelo e dos pesos.** Alguns modelos open-source de áudio só permitem uso não comercial.
- **Biblioteca de vozes** de cantores profissionais pagos: conteúdo e contratos deles.
- **Biblioteca de amps/pedais** de um parceiro: rede deles.
- **Presets** de géneros, instrumentos e efeitos: conteúdo. Fazer os nossos.
- **Pesquisa na biblioteca de música comprada no dispositivo**: integração de plataforma, fica para depois.
- **Parcerias com artistas e a marca**.
- **Patentes**: o site tem uma página de patentes. Clean-room protege contra copiar código, **não contra patentes**. Antes de lançar, verificar com um advogado se alguma cobre o método que vamos usar.

---

## 9. Lacunas

- Layout real do leitor (ordem dos controlos, mobile vs desktop).
- Formatos de exportação de stems e limites de duração/tamanho por plano.
- Se existe importação por link (YouTube etc.). Não vi nas fontes oficiais. Se existir, é uma zona de risco de direitos e de termos de serviço; **não a replicar**.
- Preços oficiais atuais (estão atrás de login).

Para fechar: criar uma conta Free própria e percorrer os ecrãs, ou capturas de ecrã. A conta Free é tua e está dentro das regras do skill, desde que os termos não proíbam usá-la para construir um concorrente. Lê os termos primeiro.

---

## 10. Dimensionamento honesto

| Âmbito | Inclui | Estimativa (1–2 devs) |
|---|---|---|
| **Paridade total** (app + Studio + plugin + voz + geração) | DAW colaborativa, modelos generativos, voz, VST | anos, mais equipa de ML. Não recomendado. |
| **MVP prática** | upload, separação 2 e 4 stems com modelo open-source, leitor/mixer, velocidade, tom, BPM, tonalidade, metrónomo + count-in, loop A-B, biblioteca, paywall com limite mensal | 2–4 meses |
| **V2** | acordes sincronizados, secções, separação personalizada, setlists colaborativas, exportação de stems, apps móveis | +3–4 meses |
| **V3** | letra sincronizada, gravação de vídeo, masterização | +3+ meses |

**Onde o `/replica-diff` vai dar nota baixa:** qualidade de separação. É o fosso deles, construído com dados licenciados e investigação própria. Um clone compete no resto: preço, foco num nicho, fluxo de prática melhor.

Maiores riscos: custo de GPU por upload (define se o Free é viável), licenças dos modelos, patentes, e utilizadores a carregar música protegida (precisa de termos de serviço e política de remoção).

Ver `features.csv` para a matriz (50 requisitos, com prioridade must/should/could/out).

---

## Fontes

- Site: https://moises.ai/ · Funcionalidades: https://moises.ai/features/ · Studio: https://moises.ai/products/moises-studio/
- Artigo oficial de funcionalidades e planos: https://moises.ai/blog/latest/moises-features
- Centro de ajuda: upload e separação (https://help.moises.ai/hc/articles/8583454469276), web/desktop (https://help.moises.ai/hc/en-us/articles/8472791352860), upload em massa (https://help.moises.ai/hc/en-us/articles/17950941743004), separação personalizada (https://help.moises.ai/hc/en-us/articles/19247459645724)
- Preços (terceiros, divergentes): https://thetoolstrunk.com/how-much-does-moises-cost/ · https://www.extruct.ai/hub/moises-ai
