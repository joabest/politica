export type Strategy = {
  id: string; title: string; category: string; objective: string; rationale: string;
  actions: string[]; indicators: string[]; risks: string[]; source: string; priority: "Alta"|"Média"|"Baixa";
};

export const studySummaries = [
  {
    id:"digital-local", title:"Comunicação digital com vínculo local", category:"Marketing digital",
    summary:"Presença constante, narrativas próximas da realidade e combinação de formatos digitais e territoriais ampliam visibilidade e conexão.",
    applications:["Vídeos curtos em locais reconhecíveis","Depoimentos e histórias comunitárias","Cobertura diária de visitas e eventos","WhatsApp como canal complementar e inclusivo"],
    caution:"Alcance não deve ser confundido com apoio eleitoral; validar resultados com métricas e pesquisa."
  },
  {
    id:"imagem", title:"Construção e manutenção de imagem", category:"Posicionamento",
    summary:"A imagem política exige coerência entre valores declarados, comportamento, discurso, identidade visual e experiência pública.",
    applications:["Definir atributos centrais","Criar mensagem principal e provas","Manter consistência entre canais","Responder dúvidas e corrigir mal-entendidos"],
    caution:"Evitar construir uma persona artificial ou promessas sem comprovação."
  },
  {
    id:"planejamento", title:"Planejamento, cronograma e recursos", category:"Gestão de campanha",
    summary:"Planejamento organiza prioridades, orçamento, responsáveis, imprensa, discurso e calendário para reduzir desperdício e improviso.",
    applications:["Plano de 7, 30 e 90 dias","Matriz esforço x impacto","Cronograma editorial e territorial","Ritos semanais de avaliação"],
    caution:"Prazos jurídicos devem ser confirmados com assessoria e calendário oficial."
  },
  {
    id:"influencer", title:"Lógica de redes e político-influenciador", category:"Comunicação digital",
    summary:"Podcasts, cortes e comunicação direta reduzem a mediação tradicional e ajudam a consolidar autoimagem, identidade e relacionamento.",
    applications:["Participações longas em entrevistas","Cortes com contexto","Séries autorais recorrentes","Distribuição multiplataforma"],
    caution:"Não transformar todo debate em espetáculo nem sacrificar conteúdo substantivo pela viralização."
  },
  {
    id:"humor", title:"Humor com responsabilidade", category:"Engajamento",
    summary:"Humor pode gerar emoção, empatia, simplificação e compartilhamento, mas também pode descontextualizar, reforçar estereótipos e degradar o debate.",
    applications:["Humor situacional leve","Memes alinhados à identidade","Autocrítica moderada","Teste de interpretação antes da publicação"],
    caution:"Não usar desinformação, humilhação, violência simbólica, injúria ou conteúdo fora de contexto."
  },
  {
    id:"integridade", title:"Integridade informacional", category:"Risco e reputação",
    summary:"A velocidade das redes exige verificação, registro de fontes, resposta coordenada e educação midiática para reduzir danos da desinformação.",
    applications:["Protocolo de checagem","Central de fatos e fontes","Classificação de risco","Resposta rápida com evidências"],
    caution:"Não amplificar boatos desnecessariamente; avaliar alcance e dano antes de responder."
  }
];

export const strategies: Strategy[] = [
  {id:"proximidade",title:"Proximidade comprovada",category:"Posicionamento",objective:"Transformar presença territorial em percepção de cuidado e capacidade de entrega.",rationale:"Narrativas locais, depoimentos e registros do cotidiano criam pertencimento quando conectados a ações concretas.",actions:["Criar série semanal ‘Na prática’","Gravar em locais reconhecíveis","Mostrar problema, ação e resultado","Incluir fala curta de moradores com consentimento","Distribuir cortes em Instagram, YouTube e WhatsApp"],indicators:["Retenção dos vídeos","Compartilhamentos","Comentários com relatos concretos","Diversidade territorial"],risks:["Exposição indevida de pessoas","Promessa sem evidência","Excesso de encenação"],source:"Síntese: marketing digital local e construção de imagem",priority:"Alta"},
  {id:"autoridade",title:"Autoridade que explica",category:"Conteúdo",objective:"Traduzir gestão e políticas públicas em mensagens simples, úteis e verificáveis.",rationale:"Conteúdo técnico ganha força quando apresenta contexto, benefício concreto, evidência e linguagem compreensível.",actions:["Quadro ‘Entenda em 60 segundos’","Carrossel problema → decisão → impacto","Entrevistas com especialistas","Publicar fonte e data nos conteúdos","Criar FAQ de temas recorrentes"],indicators:["Salvamentos","Tempo médio de visualização","Cliques em fontes","Perguntas respondidas"],risks:["Simplificação excessiva","Dado desatualizado","Tom professoral"],source:"Síntese: planejamento, discurso e transparência",priority:"Alta"},
  {id:"humanizacao",title:"Humanização coerente",category:"Branding",objective:"Aumentar proximidade sem reduzir a autoridade ou criar personagem artificial.",rationale:"Bastidores, histórias e vulnerabilidade moderada funcionam melhor quando coerentes com a trajetória pública.",actions:["Bastidores de preparação","Histórias de origem e aprendizados","Rotina com equipe e comunidade","Responder comentários selecionados","Alternar institucional, humano e serviço"],indicators:["Comentários qualitativos","Menções espontâneas","Equilíbrio de formatos","Recorrência editorial"],risks:["Superexposição familiar","Conteúdo íntimo forçado","Inconsistência de tom"],source:"Síntese: imagem, vínculo e comunicação constante",priority:"Média"},
  {id:"podcast",title:"Entrevista longa, distribuição curta",category:"Multiplataforma",objective:"Aprofundar narrativa em conversas longas e ampliar alcance com cortes contextualizados.",rationale:"Podcasts favorecem informalidade e autoimagem; cortes aumentam distribuição, desde que preservem sentido e contexto.",actions:["Preparar três mensagens centrais","Mapear perguntas sensíveis","Gravar entrevista completa","Criar 8 a 12 cortes por episódio","Publicar resumo e referências"],indicators:["Retenção longa","Alcance dos cortes","Conversão entre plataformas","Clareza das mensagens"],risks:["Corte descontextualizado","Contradição","Provocação sem substância"],source:"Síntese: podcast, lógica das redes e político-influenciador",priority:"Média"},
  {id:"humor-responsavel",title:"Humor responsável",category:"Engajamento",objective:"Gerar leveza e compartilhamento sem degradar pessoas, fatos ou instituições.",rationale:"Humor pode aproximar e simplificar, mas seu uso irresponsável favorece desinformação e violência retórica.",actions:["Definir limites editoriais","Usar humor sobre situações, não vulnerabilidades","Checar fatos e contexto","Revisão jurídica/reputacional em temas sensíveis","Excluir peças ambíguas ou ofensivas"],indicators:["Compartilhamentos positivos","Ausência de correções","Sentimento dos comentários","Aderência ao tom de voz"],risks:["Desinformação","Estereótipos","Injúria e difamação","Polarização vazia"],source:"Síntese crítica: humor político e limites democráticos",priority:"Média"},
  {id:"resposta",title:"Resposta a críticas e desinformação",category:"Reputação",objective:"Corrigir falsidades e mal-entendidos com rapidez proporcional, evidência e disciplina.",rationale:"Responder diretamente pode esclarecer dúvidas, mas amplificar boatos pequenos também gera dano; é necessário classificar risco.",actions:["Classificar alcance, gravidade e velocidade","Reunir fatos e documentos","Definir responder, monitorar ou ignorar","Publicar correção curta e verificável","Atualizar FAQ e registrar o caso"],indicators:["Tempo de resposta","Queda da propagação","Correções publicadas","Reincidência do boato"],risks:["Amplificação involuntária","Resposta emocional","Fonte fraca","Ameaça jurídica indevida"],source:"Síntese: gestão de críticas e integridade informacional",priority:"Alta"}
];

export const radarTopics = [
 {topic:"Educação",momentum:86,coverage:72,risk:18,opportunity:"Série de resultados e histórias de transformação"},
 {topic:"Saúde",momentum:91,coverage:66,risk:34,opportunity:"Conteúdo de serviço e explicação de acesso"},
 {topic:"Mulheres",momentum:82,coverage:84,risk:16,opportunity:"Liderança, autonomia e políticas concretas"},
 {topic:"Mobilidade",momentum:77,coverage:58,risk:29,opportunity:"Antes/depois e impacto no tempo das pessoas"},
 {topic:"Economia",momentum:89,coverage:49,risk:41,opportunity:"Traduzir indicadores em emprego e renda"},
 {topic:"Inovação",momentum:68,coverage:42,risk:22,opportunity:"Mostrar tecnologia aplicada a serviços"}
];
