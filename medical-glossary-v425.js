(function(){
  'use strict';

  if(window.MedNykutoGlossary) return;

  var VERSION = 'v425-global-medical-glossary';
  var POPOVER_ID = 'mnMedicalGlossaryPopover';
  var entries = [
    {key:'increase',forms:['↑'],es:'Aumenta: la cantidad o el valor sube.',br:'Aumenta: a quantidade ou o valor sobe.'},
    {key:'decrease',forms:['↓'],es:'Disminuye: la cantidad o el valor baja.',br:'Diminui: a quantidade ou o valor baixa.'},
    {key:'leads-to',forms:['→'],es:'Lleva a, produce o se transforma en.',br:'Leva a, produz ou se transforma em.'},
    {key:'reversible',forms:['↔','⇄'],es:'Puede ocurrir en los dos sentidos.',br:'Pode acontecer nos dois sentidos.'},
    {key:'approximately',forms:['≈'],es:'Aproximadamente igual; no es un valor exacto.',br:'Aproximadamente igual; não é um valor exato.'},
    {key:'greater-equal',forms:['≥'],es:'Mayor o igual que.',br:'Maior ou igual a.'},
    {key:'less-equal',forms:['≤'],es:'Menor o igual que.',br:'Menor ou igual a.'},

    {key:'homeostasis',forms:['homeostasis','homeostase'],es:'Capacidad del cuerpo para mantener estable su medio interno.',br:'Capacidade do corpo de manter estável o seu meio interno.'},
    {key:'etiology',forms:['etiología','etiologia'],es:'Causa u origen de una enfermedad.',br:'Causa ou origem de uma doença.'},
    {key:'pathogenesis',forms:['patogenia'],es:'Cómo comienza y se desarrolla una enfermedad.',br:'Como uma doença começa e se desenvolve.'},
    {key:'physiopathology',forms:['fisiopatología','fisiopatologia'],es:'Cambios del funcionamiento del cuerpo causados por una enfermedad.',br:'Mudanças no funcionamento do corpo causadas por uma doença.'},
    {key:'afferent',forms:['aferente','aferentes'],es:'Que lleva información hacia un centro, por ejemplo hacia el sistema nervioso central.',br:'Que leva informação para um centro, por exemplo para o sistema nervoso central.'},
    {key:'efferent',forms:['eferente','eferentes'],es:'Que lleva una respuesta desde un centro hacia otra parte del cuerpo.',br:'Que leva uma resposta de um centro para outra parte do corpo.'},
    {key:'proximal',forms:['proximal'],es:'Más cerca del origen o del punto de unión.',br:'Mais perto da origem ou do ponto de ligação.'},
    {key:'distal',forms:['distal'],es:'Más lejos del origen o del punto de unión.',br:'Mais longe da origem ou do ponto de ligação.'},
    {key:'ipsilateral',forms:['ipsilateral'],es:'Del mismo lado del cuerpo.',br:'Do mesmo lado do corpo.'},
    {key:'contralateral',forms:['contralateral'],es:'Del lado opuesto del cuerpo.',br:'Do lado oposto do corpo.'},
    {key:'gradient',forms:['gradiente','gradiente electroquímico','gradiente eletroquímico'],es:'Diferencia entre dos zonas que hace que una sustancia o carga tienda a moverse.',br:'Diferença entre duas áreas que faz uma substância ou carga tender a se mover.'},
    {key:'negative-feedback',forms:['retroalimentación negativa','feedback negativo'],es:'Respuesta que reduce el cambio inicial y ayuda a recuperar el equilibrio.',br:'Resposta que reduz a mudança inicial e ajuda a recuperar o equilíbrio.'},
    {key:'positive-feedback',forms:['retroalimentación positiva','feedback positivo'],es:'Respuesta que refuerza el cambio inicial.',br:'Resposta que reforça a mudança inicial.'},

    {key:'ph',forms:['pH'],es:'Medida de acidez: un pH bajo es más ácido y uno alto es más básico.',br:'Medida de acidez: pH baixo é mais ácido e pH alto é mais básico.'},
    {key:'oxygen',forms:['O₂'],es:'Oxígeno.',br:'Oxigênio.'},
    {key:'carbon-dioxide',forms:['CO₂'],es:'Dióxido de carbono, gas producido por el metabolismo y eliminado por los pulmones.',br:'Dióxido de carbono, gás produzido pelo metabolismo e eliminado pelos pulmões.'},
    {key:'hydrogen-ion',forms:['H⁺'],es:'Ion hidrógeno; cuando aumenta, el medio se vuelve más ácido.',br:'Íon hidrogênio; quando aumenta, o meio fica mais ácido.'},
    {key:'bicarbonate',forms:['HCO₃⁻','HCO3-','bicarbonato'],es:'Bicarbonato, una de las principales bases que ayudan a controlar el pH de la sangre.',br:'Bicarbonato, uma das principais bases que ajudam a controlar o pH do sangue.'},
    {key:'mmhg',forms:['mmHg'],es:'Milímetros de mercurio, unidad usada para medir presiones como la arterial o la de los gases.',br:'Milímetros de mercúrio, unidade usada para medir pressões como a arterial ou a dos gases.'},
    {key:'meql',forms:['mEq/L'],es:'Miliequivalentes por litro, unidad usada para expresar la concentración de algunos iones.',br:'Miliequivalentes por litro, unidade usada para expressar a concentração de alguns íons.'},
    {key:'pao2',forms:['PaO₂','PaO2'],es:'Presión de oxígeno disuelto en la sangre arterial.',br:'Pressão do oxigênio dissolvido no sangue arterial.'},
    {key:'paco2',forms:['PaCO₂','PaCO2'],es:'Presión de dióxido de carbono en la sangre arterial; ayuda a valorar la ventilación.',br:'Pressão de dióxido de carbono no sangue arterial; ajuda a avaliar a ventilação.'},
    {key:'spo2',forms:['SpO₂','SpO2'],es:'Saturación de oxígeno estimada por el oxímetro colocado en el dedo.',br:'Saturação de oxigênio estimada pelo oxímetro colocado no dedo.'},
    {key:'sao2',forms:['SaO₂','SaO2'],es:'Porcentaje de hemoglobina arterial que lleva oxígeno.',br:'Porcentagem da hemoglobina arterial que transporta oxigênio.'},
    {key:'vq',forms:['V/Q'],es:'Relación entre el aire que llega a los alvéolos y la sangre que llega a sus capilares.',br:'Relação entre o ar que chega aos alvéolos e o sangue que chega aos seus capilares.'},
    {key:'p50',forms:['P50'],es:'Presión de oxígeno en la que la hemoglobina está saturada al 50%; indica su afinidad por el oxígeno.',br:'Pressão de oxigênio em que a hemoglobina está 50% saturada; indica sua afinidade pelo oxigênio.'},
    {key:'gfr',forms:['TFG','RFG'],es:'Tasa de filtración glomerular: cantidad de plasma que los riñones filtran por minuto.',br:'Taxa de filtração glomerular: quantidade de plasma que os rins filtram por minuto.'},
    {key:'dna',forms:['ADN','DNA'],es:'Material que guarda la información genética de las células.',br:'Material que armazena a informação genética das células.'},
    {key:'rna',forms:['ARN','RNA'],es:'Molécula que ayuda a usar la información genética para fabricar proteínas y realizar otras funciones.',br:'Molécula que ajuda a usar a informação genética para produzir proteínas e realizar outras funções.'},
    {key:'ecg',forms:['ECG','EKG'],es:'Electrocardiograma: registro de la actividad eléctrica del corazón.',br:'Eletrocardiograma: registro da atividade elétrica do coração.'},
    {key:'blood-pressure',forms:['PA','TA'],es:'Presión o tensión arterial: fuerza que ejerce la sangre sobre las arterias.',br:'Pressão arterial: força que o sangue exerce sobre as artérias.'},
    {key:'heart-rate',forms:['FC'],es:'Frecuencia cardíaca: número de latidos por minuto.',br:'Frequência cardíaca: número de batimentos por minuto.'},
    {key:'respiratory-rate',forms:['FR'],es:'Frecuencia respiratoria: número de respiraciones por minuto.',br:'Frequência respiratória: número de respirações por minuto.'},
    {key:'csf',forms:['LCR'],es:'Líquido cefalorraquídeo: líquido que rodea y protege el cerebro y la médula espinal.',br:'Líquido cefalorraquidiano: líquido que envolve e protege o cérebro e a medula espinal.'},
    {key:'cns',forms:['SNC'],es:'Sistema nervioso central: cerebro y médula espinal.',br:'Sistema nervoso central: cérebro e medula espinal.'},
    {key:'pns',forms:['SNP'],es:'Sistema nervioso periférico: nervios que conectan el sistema nervioso central con el cuerpo.',br:'Sistema nervoso periférico: nervos que ligam o sistema nervoso central ao corpo.'},
    {key:'ans',forms:['SNA'],es:'Sistema nervioso autónomo: regula funciones involuntarias como pulso, digestión y presión.',br:'Sistema nervoso autônomo: regula funções involuntárias como pulso, digestão e pressão.'},
    {key:'ldl',forms:['LDL'],es:'Partícula que transporta colesterol hacia los tejidos; un exceso favorece placas en las arterias.',br:'Partícula que leva colesterol aos tecidos; em excesso favorece placas nas artérias.'},
    {key:'hdl',forms:['HDL'],es:'Partícula que ayuda a llevar colesterol de los tejidos al hígado.',br:'Partícula que ajuda a levar colesterol dos tecidos ao fígado.'},
    {key:'vldl',forms:['VLDL'],es:'Partícula producida por el hígado que transporta sobre todo triglicéridos.',br:'Partícula produzida pelo fígado que transporta principalmente triglicerídeos.'},
    {key:'hemoglobin',forms:['Hb','hemoglobina'],es:'Proteína de los glóbulos rojos que transporta oxígeno.',br:'Proteína das hemácias que transporta oxigênio.'},
    {key:'hematocrit',forms:['Hto','hematocrito'],es:'Porcentaje de la sangre ocupado por glóbulos rojos.',br:'Porcentagem do sangue ocupada pelas hemácias.'},
    {key:'mcv',forms:['VCM'],es:'Volumen corpuscular medio: tamaño promedio de los glóbulos rojos.',br:'Volume corpuscular médio: tamanho médio das hemácias.'},
    {key:'mch',forms:['HCM'],es:'Cantidad promedio de hemoglobina dentro de cada glóbulo rojo.',br:'Quantidade média de hemoglobina dentro de cada hemácia.'},
    {key:'mchc',forms:['CHCM'],es:'Concentración promedio de hemoglobina dentro de los glóbulos rojos.',br:'Concentração média de hemoglobina dentro das hemácias.'},
    {key:'raas',forms:['SRAA'],es:'Sistema renina-angiotensina-aldosterona: regula presión arterial, sodio y volumen de sangre.',br:'Sistema renina-angiotensina-aldosterona: regula pressão, sódio e volume de sangue.'},
    {key:'adh',forms:['ADH'],es:'Hormona antidiurética: ayuda al riñón a conservar agua.',br:'Hormônio antidiurético: ajuda o rim a conservar água.'},
    {key:'pth',forms:['PTH'],es:'Parathormona: regula principalmente el calcio y el fosfato en sangre.',br:'Paratormônio: regula principalmente cálcio e fosfato no sangue.'},
    {key:'tsh',forms:['TSH'],es:'Hormona que estimula la tiroides para producir hormonas tiroideas.',br:'Hormônio que estimula a tireoide a produzir hormônios tireoidianos.'},
    {key:'acth',forms:['ACTH'],es:'Hormona que estimula la corteza suprarrenal, especialmente la producción de cortisol.',br:'Hormônio que estimula o córtex adrenal, especialmente a produção de cortisol.'},
    {key:'fsh',forms:['FSH'],es:'Hormona que participa en la maduración de folículos ováricos y en la producción de espermatozoides.',br:'Hormônio que participa da maturação dos folículos ovarianos e da produção de espermatozoides.'},
    {key:'lh',forms:['LH'],es:'Hormona que desencadena la ovulación y estimula la producción de hormonas sexuales.',br:'Hormônio que desencadeia a ovulação e estimula a produção de hormônios sexuais.'},
    {key:'gnrh',forms:['GnRH'],es:'Hormona del hipotálamo que hace liberar FSH y LH.',br:'Hormônio do hipotálamo que estimula a liberação de FSH e LH.'},
    {key:'growth-hormone',forms:['GH'],es:'Hormona del crecimiento: favorece crecimiento y regula el uso de nutrientes.',br:'Hormônio do crescimento: favorece o crescimento e regula o uso de nutrientes.'},
    {key:'erythropoietin',forms:['EPO'],es:'Hormona producida sobre todo por el riñón que estimula la formación de glóbulos rojos.',br:'Hormônio produzido principalmente pelo rim que estimula a formação de hemácias.'},
    {key:'hypertension',forms:['HTA'],es:'Hipertensión arterial: presión arterial elevada de forma persistente.',br:'Hipertensão arterial: pressão arterial elevada de forma persistente.'},
    {key:'diabetes',forms:['DM','DM2'],es:'Diabetes mellitus: la glucosa en sangre permanece demasiado alta; DM2 indica el tipo 2.',br:'Diabetes mellitus: a glicose no sangue permanece muito alta; DM2 indica o tipo 2.'},
    {key:'bmi',forms:['IMC'],es:'Índice de masa corporal: relación entre peso y altura usada como orientación general.',br:'Índice de massa corporal: relação entre peso e altura usada como orientação geral.'},
    {key:'acute-kidney-injury',forms:['IRA'],es:'Insuficiencia renal aguda: caída rápida del funcionamiento de los riñones.',br:'Insuficiência renal aguda: queda rápida do funcionamento dos rins.'},
    {key:'chronic-kidney-disease',forms:['IRC','ERC','DRC'],es:'Enfermedad o insuficiencia renal crónica: pérdida del funcionamiento renal durante meses o años.',br:'Doença ou insuficiência renal crônica: perda da função renal durante meses ou anos.'},
    {key:'urinary-infection',forms:['ITU','IVU'],es:'Infección urinaria: infección de alguna parte de las vías urinarias.',br:'Infecção urinária: infecção de alguma parte das vias urinárias.'},
    {key:'nsaid',forms:['AINE','AINEs'],es:'Antiinflamatorio no esteroideo, como ibuprofeno; reduce dolor e inflamación.',br:'Anti-inflamatório não esteroidal, como ibuprofeno; reduz dor e inflamação.'},
    {key:'ace-inhibitor',forms:['IECA'],es:'Medicamento que bloquea una enzima del sistema de presión arterial y dilata los vasos.',br:'Medicamento que bloqueia uma enzima do sistema de pressão e dilata os vasos.'},
    {key:'arb',forms:['ARA-II','ARAII','BRA'],es:'Medicamento que bloquea el receptor de angiotensina II y ayuda a bajar la presión.',br:'Medicamento que bloqueia o receptor da angiotensina II e ajuda a reduzir a pressão.'},
    {key:'fev1',forms:['VEF₁','VEF1','FEV₁','FEV1'],es:'Volumen de aire expulsado con fuerza durante el primer segundo de una espiración.',br:'Volume de ar expulso com força no primeiro segundo de uma expiração.'},
    {key:'fvc',forms:['CVF','FVC'],es:'Cantidad total de aire que se puede expulsar con fuerza después de inspirar al máximo.',br:'Quantidade total de ar que pode ser expulsa com força após inspirar ao máximo.'},

    {key:'hypercapnia',forms:['hipercapnia'],es:'Aumento del CO₂ en la sangre.',br:'Aumento do CO₂ no sangue.'},
    {key:'hypocapnia',forms:['hipocapnia'],es:'Disminución del CO₂ en la sangre.',br:'Diminuição do CO₂ no sangue.'},
    {key:'hypoxemia',forms:['hipoxemia'],es:'Cantidad de oxígeno en la sangre más baja de lo normal.',br:'Quantidade de oxigênio no sangue abaixo do normal.'},
    {key:'hypoxia',forms:['hipoxia','hipóxia'],es:'Los tejidos no reciben o no pueden usar suficiente oxígeno.',br:'Os tecidos não recebem ou não conseguem usar oxigênio suficiente.'},
    {key:'dyspnea',forms:['disnea','dispneia'],es:'Sensación de falta de aire o dificultad para respirar.',br:'Sensação de falta de ar ou dificuldade para respirar.'},
    {key:'tachypnea',forms:['taquipnea','taquipneia'],es:'Respiración más rápida de lo normal.',br:'Respiração mais rápida que o normal.'},
    {key:'bradypnea',forms:['bradipnea','bradipneia'],es:'Respiración más lenta de lo normal.',br:'Respiração mais lenta que o normal.'},
    {key:'apnea',forms:['apnea'],es:'Pausa temporal de la respiración.',br:'Pausa temporária da respiração.'},
    {key:'cyanosis',forms:['cianosis','cianose'],es:'Color azulado de piel o mucosas, a menudo relacionado con poca oxigenación.',br:'Cor azulada da pele ou das mucosas, muitas vezes ligada à baixa oxigenação.'},
    {key:'alveolar-ventilation',forms:['ventilación alveolar','ventilação alveolar'],es:'Aire nuevo que llega cada minuto a los alvéolos y participa en el intercambio de gases.',br:'Ar novo que chega aos alvéolos a cada minuto e participa da troca de gases.'},
    {key:'perfusion',forms:['perfusión','perfusão'],es:'Paso de sangre por los vasos de un tejido.',br:'Passagem de sangue pelos vasos de um tecido.'},
    {key:'diffusion',forms:['difusión','difusão'],es:'Movimiento de moléculas desde donde hay más hacia donde hay menos.',br:'Movimento de moléculas de onde há mais para onde há menos.'},
    {key:'shunt',forms:['shunt'],es:'Sangre que pasa al lado arterial sin oxigenarse bien.',br:'Sangue que chega ao lado arterial sem se oxigenar bem.'},
    {key:'dead-space',forms:['espacio muerto','espaço morto'],es:'Zona ventilada en la que el aire no participa de forma útil en el intercambio de gases.',br:'Área ventilada em que o ar não participa de forma útil da troca de gases.'},
    {key:'compliance',forms:['compliance','distensibilidad','complacência'],es:'Facilidad con la que el pulmón o un vaso se expande.',br:'Facilidade com que o pulmão ou um vaso se expande.'},
    {key:'surfactant',forms:['surfactante'],es:'Sustancia que reduce la tensión dentro de los alvéolos y ayuda a mantenerlos abiertos.',br:'Substância que reduz a tensão nos alvéolos e ajuda a mantê-los abertos.'},
    {key:'chemoreceptor',forms:['quimiorreceptor','quimiorreceptores'],es:'Sensor que detecta cambios químicos como CO₂, O₂ o pH.',br:'Sensor que detecta mudanças químicas como CO₂, O₂ ou pH.'},
    {key:'mechanoreceptor',forms:['mecanorreceptor','mecanorreceptores'],es:'Sensor que responde al estiramiento, presión o movimiento.',br:'Sensor que responde a estiramento, pressão ou movimento.'},
    {key:'baroreceptor',forms:['barorreceptor','barorreceptores'],es:'Sensor que detecta cambios de presión, especialmente en las arterias.',br:'Sensor que detecta mudanças de pressão, principalmente nas artérias.'},
    {key:'bohr-effect',forms:['efecto Bohr','efeito Bohr'],es:'Con más CO₂ o acidez, la hemoglobina libera oxígeno con mayor facilidad.',br:'Com mais CO₂ ou acidez, a hemoglobina libera oxigênio com mais facilidade.'},
    {key:'haldane-effect',forms:['efecto Haldane','efeito Haldane'],es:'La hemoglobina sin oxígeno puede transportar más CO₂ y H⁺.',br:'A hemoglobina sem oxigênio consegue transportar mais CO₂ e H⁺.'},
    {key:'atelectasis',forms:['atelectasia'],es:'Parte del pulmón pierde aire y sus alvéolos se cierran.',br:'Parte do pulmão perde ar e seus alvéolos se fecham.'},
    {key:'emphysema',forms:['enfisema'],es:'Daño de los alvéolos que reduce la superficie disponible para intercambiar gases.',br:'Dano dos alvéolos que reduz a área disponível para trocar gases.'},
    {key:'fibrosis',forms:['fibrosis'],es:'Formación excesiva de tejido cicatricial que vuelve un órgano más rígido.',br:'Formação excessiva de tecido cicatricial que deixa um órgão mais rígido.'},
    {key:'bronchoconstriction',forms:['broncoconstricción','broncoconstrição'],es:'Estrechamiento de los bronquios por contracción de su músculo.',br:'Estreitamento dos brônquios pela contração de seu músculo.'},
    {key:'copd',forms:['EPOC','DPOC'],es:'Enfermedad pulmonar obstructiva crónica: dificulta sacar el aire de los pulmones.',br:'Doença pulmonar obstrutiva crônica: dificulta a saída do ar dos pulmões.'},

    {key:'metabolism',forms:['metabolismo'],es:'Conjunto de reacciones químicas que mantienen vivo al organismo.',br:'Conjunto de reações químicas que mantêm o organismo vivo.'},
    {key:'anabolism',forms:['anabolismo'],es:'Reacciones que construyen moléculas y suelen gastar energía.',br:'Reações que constroem moléculas e geralmente gastam energia.'},
    {key:'catabolism',forms:['catabolismo'],es:'Reacciones que degradan moléculas y liberan energía.',br:'Reações que degradam moléculas e liberam energia.'},
    {key:'glycolysis',forms:['glucólisis','glicólise'],es:'Vía que transforma glucosa en piruvato y produce una pequeña cantidad de energía.',br:'Via que transforma glicose em piruvato e produz uma pequena quantidade de energia.'},
    {key:'gluconeogenesis',forms:['gluconeogénesis','gliconeogênese'],es:'Producción de glucosa a partir de sustancias que no son carbohidratos.',br:'Produção de glicose a partir de substâncias que não são carboidratos.'},
    {key:'glycogenolysis',forms:['glucogenólisis','glicogenólise'],es:'Ruptura del glucógeno para obtener glucosa utilizable.',br:'Quebra do glicogênio para obter glicose utilizável.'},
    {key:'glycogenesis',forms:['glucogénesis','glicogênese'],es:'Formación de glucógeno para guardar glucosa.',br:'Formação de glicogênio para armazenar glicose.'},
    {key:'phosphorylation',forms:['fosforilación','fosforilação'],es:'Adición de un grupo fosfato a una molécula.',br:'Adição de um grupo fosfato a uma molécula.'},
    {key:'oxidation',forms:['oxidación','oxidação'],es:'Pérdida de electrones durante una reacción química.',br:'Perda de elétrons durante uma reação química.'},
    {key:'reduction',forms:['reducción','redução'],es:'Ganancia de electrones durante una reacción química.',br:'Ganho de elétrons durante uma reação química.'},
    {key:'atp',forms:['ATP'],es:'Principal molécula que entrega energía inmediata a la célula.',br:'Principal molécula que fornece energia imediata à célula.'},
    {key:'adp',forms:['ADP'],es:'Molécula que puede recibir un fosfato para formar ATP.',br:'Molécula que pode receber um fosfato para formar ATP.'},
    {key:'amp',forms:['AMP'],es:'Molécula con un fosfato; su aumento puede señalar poca energía celular.',br:'Molécula com um fosfato; seu aumento pode indicar pouca energia celular.'},
    {key:'nadh',forms:['NADH'],es:'Molécula que transporta electrones ricos en energía.',br:'Molécula que transporta elétrons ricos em energia.'},
    {key:'nad-plus',forms:['NAD⁺','NAD+'],es:'Forma que acepta electrones y se convierte en NADH.',br:'Forma que recebe elétrons e se transforma em NADH.'},
    {key:'fadh2',forms:['FADH₂','FADH2'],es:'Molécula que lleva electrones hacia la producción de energía.',br:'Molécula que leva elétrons para a produção de energia.'},
    {key:'enzyme',forms:['enzima','enzimas'],es:'Proteína que acelera una reacción sin consumirse en ella.',br:'Proteína que acelera uma reação sem ser consumida nela.'},
    {key:'substrate',forms:['sustrato','substrato'],es:'Molécula sobre la que actúa una enzima.',br:'Molécula sobre a qual uma enzima atua.'},
    {key:'cofactor',forms:['cofactor','coenzima'],es:'Ayudante que una enzima necesita para funcionar; puede ser un ion o una molécula orgánica.',br:'Auxiliar de que uma enzima precisa para funcionar; pode ser um íon ou uma molécula orgânica.'},
    {key:'allosteric',forms:['alostérico','alostérica','alostérica','alosterismo'],es:'Regulación de una proteína al unirse una molécula en un sitio distinto del sitio activo.',br:'Regulação de uma proteína quando uma molécula se liga fora do sítio ativo.'},
    {key:'cytosol',forms:['citosol','citosólico','citosólicos'],es:'Parte líquida del interior de la célula, fuera de los orgánulos.',br:'Parte líquida do interior da célula, fora das organelas.'},
    {key:'mitochondria',forms:['mitocondria','mitocôndria'],es:'Orgánulo que participa en la producción de gran parte del ATP.',br:'Organela que participa da produção de grande parte do ATP.'},
    {key:'pyruvate',forms:['piruvato'],es:'Producto final principal de la glucólisis.',br:'Principal produto final da glicólise.'},
    {key:'lactate',forms:['lactato'],es:'Molécula formada a partir del piruvato para regenerar NAD⁺ cuando es necesario.',br:'Molécula formada a partir do piruvato para regenerar NAD⁺ quando necessário.'},
    {key:'hexokinase',forms:['hexoquinasa','hexoquinase'],es:'Enzima que coloca un fosfato en la glucosa al inicio de la glucólisis.',br:'Enzima que coloca um fosfato na glicose no início da glicólise.'},
    {key:'glucokinase',forms:['glucoquinasa','glicoquinase'],es:'Enzima del hígado y páncreas que fosforila glucosa cuando hay suficiente.',br:'Enzima do fígado e pâncreas que fosforila glicose quando há quantidade suficiente.'},
    {key:'pfk1',forms:['PFK-1','PFK I'],es:'Enzima reguladora clave que compromete la glucosa con la vía glucolítica.',br:'Enzima reguladora central que direciona a glicose para a glicólise.'},
    {key:'gkrp',forms:['GKRP'],es:'Proteína que regula la glucoquinasa del hígado y puede retenerla en el núcleo.',br:'Proteína que regula a glicoquinase do fígado e pode retê-la no núcleo.'},
    {key:'glut4',forms:['GLUT4'],es:'Transportador que lleva glucosa a músculo y tejido adiposo en respuesta a insulina.',br:'Transportador que leva glicose ao músculo e tecido adiposo em resposta à insulina.'},
    {key:'glut5',forms:['GLUT5'],es:'Transportador que mueve principalmente fructosa.',br:'Transportador que move principalmente frutose.'},
    {key:'g6p',forms:['G6P'],es:'Glucosa-6-fosfato, glucosa que ya recibió un fosfato dentro de la célula.',br:'Glicose-6-fosfato, glicose que já recebeu um fosfato dentro da célula.'},
    {key:'f6p',forms:['F6P'],es:'Fructosa-6-fosfato, intermediario de la glucólisis.',br:'Frutose-6-fosfato, intermediário da glicólise.'},
    {key:'g3p',forms:['G3P'],es:'Gliceraldehído-3-fosfato, molécula de tres carbonos de la glucólisis.',br:'Gliceraldeído-3-fosfato, molécula de três carbonos da glicólise.'},
    {key:'pep',forms:['PEP'],es:'Fosfoenolpiruvato, intermediario de alta energía antes de formar piruvato.',br:'Fosfoenolpiruvato, intermediário de alta energia antes de formar piruvato.'},

    {key:'pathogen',forms:['patógeno','patógenos'],es:'Microorganismo o agente capaz de causar enfermedad.',br:'Microrganismo ou agente capaz de causar doença.'},
    {key:'virulence',forms:['virulencia','virulência'],es:'Capacidad de un agente para causar daño o enfermedad grave.',br:'Capacidade de um agente de causar dano ou doença grave.'},
    {key:'colonization',forms:['colonización','colonização'],es:'Presencia y crecimiento de microbios sin que necesariamente causen enfermedad.',br:'Presença e crescimento de micróbios sem necessariamente causar doença.'},
    {key:'microbiota',forms:['microbiota'],es:'Conjunto de microorganismos que viven normalmente en un lugar del cuerpo.',br:'Conjunto de microrganismos que vivem normalmente em uma parte do corpo.'},
    {key:'hypha',forms:['hifa','hifas'],es:'Filamento que forma la estructura de muchos hongos.',br:'Filamento que forma a estrutura de muitos fungos.'},
    {key:'mycelium',forms:['micelio','micélio'],es:'Conjunto de hifas de un hongo.',br:'Conjunto de hifas de um fungo.'},
    {key:'conidium',forms:['conidia','conidio','conídios'],es:'Espora asexual producida por algunos hongos.',br:'Esporo assexuado produzido por alguns fungos.'},
    {key:'dimorphism',forms:['dimorfismo'],es:'Capacidad de algunos hongos para adoptar dos formas según las condiciones.',br:'Capacidade de alguns fungos de assumir duas formas conforme as condições.'},
    {key:'dermatophyte',forms:['dermatofito','dermatofitos'],es:'Hongo que utiliza queratina y puede infectar piel, pelo o uñas.',br:'Fungo que utiliza queratina e pode infectar pele, cabelo ou unhas.'},
    {key:'mycosis',forms:['micosis','micose','micoses'],es:'Infección causada por hongos.',br:'Infecção causada por fungos.'},
    {key:'subcutaneous-mycosis',forms:['micosis subcutánea','micosis subcutáneas','micoses subcutâneas'],es:'Infección por hongos que alcanza piel y tejido debajo de ella, a menudo tras una herida.',br:'Infecção por fungos que atinge a pele e o tecido abaixo dela, muitas vezes após uma ferida.'},
    {key:'opportunistic',forms:['oportunista','oportunistas'],es:'Que causa enfermedad sobre todo cuando las defensas están debilitadas.',br:'Que causa doença principalmente quando as defesas estão enfraquecidas.'},
    {key:'koh',forms:['KOH'],es:'Hidróxido de potasio, usado para aclarar una muestra y facilitar la búsqueda de hongos al microscopio.',br:'Hidróxido de potássio, usado para clarear uma amostra e facilitar a busca de fungos no microscópio.'},
    {key:'sabouraud',forms:['agar Sabouraud','ágar Sabouraud'],es:'Medio de laboratorio usado para cultivar hongos.',br:'Meio de laboratório usado para cultivar fungos.'},
    {key:'pcr',forms:['PCR'],es:'Técnica que multiplica fragmentos de material genético para poder detectarlos.',br:'Técnica que multiplica trechos de material genético para permitir sua detecção.'},
    {key:'reservoir',forms:['reservorio','reservatório'],es:'Lugar, persona, animal o ambiente donde un agente vive y puede multiplicarse.',br:'Local, pessoa, animal ou ambiente onde um agente vive e pode se multiplicar.'},
    {key:'vector',forms:['vector'],es:'Ser vivo que transporta un agente infeccioso de un huésped a otro.',br:'Ser vivo que transporta um agente infeccioso de um hospedeiro para outro.'},
    {key:'fomite',forms:['fómite','fômite'],es:'Objeto contaminado que puede ayudar a transmitir un agente infeccioso.',br:'Objeto contaminado que pode ajudar a transmitir um agente infeccioso.'},
    {key:'biofilm',forms:['biofilm','biopelícula'],es:'Comunidad de microorganismos adherida a una superficie y protegida por una capa propia.',br:'Comunidade de microrganismos aderida a uma superfície e protegida por uma camada própria.'},
    {key:'asepsis',forms:['asepsia'],es:'Medidas para evitar que microorganismos contaminen un lugar o material.',br:'Medidas para impedir que microrganismos contaminem um local ou material.'},
    {key:'antisepsis',forms:['antisepsia'],es:'Uso de sustancias en tejidos vivos para reducir microorganismos.',br:'Uso de substâncias em tecidos vivos para reduzir microrganismos.'},
    {key:'sterilization',forms:['esterilización','esterilização'],es:'Proceso que elimina todas las formas de vida microbiana, incluidas las esporas.',br:'Processo que elimina todas as formas de vida microbiana, inclusive esporos.'},
    {key:'disinfection',forms:['desinfección','desinfecção'],es:'Proceso que elimina muchos microorganismos de objetos, pero no siempre todas las esporas.',br:'Processo que elimina muitos microrganismos de objetos, mas nem sempre todos os esporos.'},
    {key:'zoonosis',forms:['zoonosis','zoonose'],es:'Enfermedad que puede pasar de animales a seres humanos.',br:'Doença que pode passar de animais para seres humanos.'},

    {key:'incidence',forms:['incidencia','incidência'],es:'Cantidad de casos nuevos que aparecen en una población durante un período.',br:'Quantidade de casos novos que surgem em uma população durante um período.'},
    {key:'prevalence',forms:['prevalencia','prevalência'],es:'Cantidad de personas que tienen una condición en un momento o período.',br:'Quantidade de pessoas que têm uma condição em um momento ou período.'},
    {key:'morbidity',forms:['morbilidad','morbidade'],es:'Frecuencia de enfermedad o problemas de salud en una población.',br:'Frequência de doenças ou problemas de saúde em uma população.'},
    {key:'mortality',forms:['mortalidad','mortalidade'],es:'Frecuencia de muertes en una población durante un período.',br:'Frequência de mortes em uma população durante um período.'},
    {key:'fatality',forms:['letalidad','letalidade'],es:'Proporción de personas con una enfermedad que mueren por ella.',br:'Proporção de pessoas com uma doença que morrem por causa dela.'},
    {key:'relative-risk',forms:['riesgo relativo','risco relativo'],es:'Compara el riesgo de un resultado entre dos grupos.',br:'Compara o risco de um resultado entre dois grupos.'},
    {key:'odds-ratio',forms:['odds ratio'],es:'Compara las posibilidades de un resultado entre dos grupos.',br:'Compara as chances de um resultado entre dois grupos.'},
    {key:'bias',forms:['sesgo','viés'],es:'Error sistemático que puede alejar un estudio de la verdad.',br:'Erro sistemático que pode afastar um estudo da verdade.'},
    {key:'confounder',forms:['confusor','factor de confusión','fator de confusão'],es:'Factor relacionado con la exposición y el resultado que puede distorsionar su relación.',br:'Fator ligado à exposição e ao resultado que pode distorcer a relação entre eles.'},
    {key:'sensitivity',forms:['sensibilidad','sensibilidade'],es:'Capacidad de una prueba para detectar a quienes realmente tienen la condición.',br:'Capacidade de um teste de identificar quem realmente tem a condição.'},
    {key:'specificity',forms:['especificidad','especificidade'],es:'Capacidad de una prueba para reconocer a quienes realmente no tienen la condición.',br:'Capacidade de um teste de reconhecer quem realmente não tem a condição.'},
    {key:'screening',forms:['tamizaje','cribado','rastreamento'],es:'Búsqueda de una enfermedad en personas que todavía no tienen síntomas claros.',br:'Busca de uma doença em pessoas que ainda não apresentam sintomas claros.'},
    {key:'endemic',forms:['endemia'],es:'Presencia habitual de una enfermedad en una zona o población.',br:'Presença habitual de uma doença em uma área ou população.'},
    {key:'epidemic',forms:['epidemia'],es:'Más casos de los esperados en una población y período determinados.',br:'Mais casos do que o esperado em uma população e período determinados.'},
    {key:'pandemic',forms:['pandemia'],es:'Epidemia que se extiende por varios países o continentes.',br:'Epidemia que se espalha por vários países ou continentes.'},
    {key:'outbreak',forms:['brote','surto'],es:'Aumento localizado de casos relacionados entre sí.',br:'Aumento localizado de casos relacionados entre si.'},
    {key:'primary-care',forms:['APS','atención primaria de salud','atenção primária à saúde'],es:'Primer nivel de atención, cercano a la comunidad, que previene, acompaña y resuelve gran parte de los problemas de salud.',br:'Primeiro nível de atenção, perto da comunidade, que previne, acompanha e resolve grande parte dos problemas de saúde.'},
    {key:'triage',forms:['triage','triaje'],es:'Clasificación rápida para atender primero a quien tiene mayor urgencia.',br:'Classificação rápida para atender primeiro quem tem maior urgência.'},
    {key:'equity',forms:['equidad','equidade'],es:'Dar a cada persona el apoyo que necesita para tener una oportunidad justa.',br:'Dar a cada pessoa o apoio de que precisa para ter uma oportunidade justa.'},
    {key:'biopsychosocial',forms:['biopsicosocial'],es:'Enfoque que considera juntos el cuerpo, la mente y el entorno social.',br:'Abordagem que considera juntos o corpo, a mente e o ambiente social.'},
    {key:'macronutrient',forms:['macronutriente','macronutrientes'],es:'Nutriente necesario en cantidades grandes, como carbohidratos, proteínas y grasas.',br:'Nutriente necessário em grandes quantidades, como carboidratos, proteínas e gorduras.'},
    {key:'micronutrient',forms:['micronutriente','micronutrientes'],es:'Vitamina o mineral necesario en cantidades pequeñas.',br:'Vitamina ou mineral necessário em pequenas quantidades.'},
    {key:'bioavailability',forms:['biodisponibilidad','biodisponibilidade'],es:'Parte de una sustancia que el cuerpo logra absorber y utilizar.',br:'Parte de uma substância que o corpo consegue absorver e utilizar.'},
    {key:'basal-metabolism',forms:['metabolismo basal'],es:'Energía mínima que el cuerpo gasta en reposo para mantener funciones vitales.',br:'Energia mínima que o corpo gasta em repouso para manter funções vitais.'},
    {key:'energy-balance',forms:['balance energético','balanço energético'],es:'Comparación entre la energía que entra con los alimentos y la que el cuerpo gasta.',br:'Comparação entre a energia que entra pelos alimentos e a que o corpo gasta.'},
    {key:'fortified',forms:['fortificado','fortificada'],es:'Alimento al que se añadieron nutrientes para mejorar su valor nutricional.',br:'Alimento ao qual foram adicionados nutrientes para melhorar seu valor nutricional.'},
    {key:'biofortified',forms:['biofortificado','biofortificada'],es:'Alimento cuyo cultivo fue mejorado para contener más nutrientes.',br:'Alimento cujo cultivo foi melhorado para conter mais nutrientes.'},
    {key:'glycemic-index',forms:['índice glucémico','índice glicêmico'],es:'Medida de cuánto eleva la glucosa en sangre un alimento con carbohidratos.',br:'Medida de quanto um alimento com carboidrato eleva a glicose no sangue.'},

    {key:'osmolarity',forms:['osmolaridad','osmolaridade'],es:'Cantidad de partículas disueltas por litro de solución.',br:'Quantidade de partículas dissolvidas por litro de solução.'},
    {key:'osmolality',forms:['osmolalidad','osmolalidade'],es:'Cantidad de partículas disueltas por kilogramo de agua.',br:'Quantidade de partículas dissolvidas por quilograma de água.'},
    {key:'tonicity',forms:['tonicidad','tonicidade'],es:'Efecto de una solución sobre el volumen de una célula.',br:'Efeito de uma solução sobre o volume de uma célula.'},
    {key:'isotonic',forms:['isotónico','isotónica','isotônico','isotônica'],es:'Solución que no cambia de forma importante el volumen de la célula.',br:'Solução que não altera de forma importante o volume da célula.'},
    {key:'hypotonic',forms:['hipotónico','hipotónica','hipotônico','hipotônica'],es:'Solución que hace entrar agua en la célula y puede hincharla.',br:'Solução que faz a água entrar na célula e pode inchá-la.'},
    {key:'hypertonic',forms:['hipertónico','hipertónica','hipertônico','hipertônica'],es:'Solución que extrae agua de la célula y puede encogerla.',br:'Solução que retira água da célula e pode encolhê-la.'},
    {key:'depolarization',forms:['despolarización','despolarização'],es:'El interior de la célula se vuelve menos negativo.',br:'O interior da célula fica menos negativo.'},
    {key:'repolarization',forms:['repolarización','repolarização'],es:'La membrana vuelve hacia su voltaje de reposo.',br:'A membrana volta em direção ao seu potencial de repouso.'},
    {key:'hyperpolarization',forms:['hiperpolarización','hiperpolarização'],es:'El interior de la célula se vuelve más negativo de lo habitual.',br:'O interior da célula fica mais negativo que o habitual.'},
    {key:'action-potential',forms:['potencial de acción','potencial de ação'],es:'Cambio rápido del voltaje de una célula que permite transmitir una señal.',br:'Mudança rápida da voltagem de uma célula que permite transmitir um sinal.'},
    {key:'threshold',forms:['umbral','limiar'],es:'Nivel mínimo necesario para desencadenar una respuesta.',br:'Nível mínimo necessário para desencadear uma resposta.'},
    {key:'refractory',forms:['refractario','refractário'],es:'Período en que una célula no puede o tiene más dificultad para generar otra señal.',br:'Período em que uma célula não consegue ou tem mais dificuldade para gerar outro sinal.'},
    {key:'synapse',forms:['sinapsis','sinapse'],es:'Punto donde una neurona comunica una señal a otra célula.',br:'Ponto onde um neurônio transmite um sinal para outra célula.'},
    {key:'neurotransmitter',forms:['neurotransmisor','neurotransmissor'],es:'Sustancia química usada por las neuronas para enviar señales.',br:'Substância química usada pelos neurônios para enviar sinais.'},
    {key:'agonist',forms:['agonista'],es:'Sustancia que activa un receptor y produce una respuesta.',br:'Substância que ativa um receptor e produz uma resposta.'},
    {key:'antagonist',forms:['antagonista'],es:'Sustancia que bloquea un receptor y reduce su respuesta.',br:'Substância que bloqueia um receptor e reduz sua resposta.'},
    {key:'clearance',forms:['clearance','aclaramiento'],es:'Volumen de plasma del que el riñón elimina una sustancia por unidad de tiempo.',br:'Volume de plasma do qual o rim remove uma substância por unidade de tempo.'},
    {key:'filtration',forms:['filtración glomerular','filtração glomerular'],es:'Paso de agua y sustancias pequeñas desde la sangre hacia el inicio del túbulo renal.',br:'Passagem de água e pequenas substâncias do sangue para o início do túbulo renal.'},
    {key:'reabsorption',forms:['reabsorción','reabsorção'],es:'Retorno de una sustancia desde el túbulo renal hacia la sangre.',br:'Retorno de uma substância do túbulo renal para o sangue.'},
    {key:'secretion',forms:['secreción tubular','secreção tubular'],es:'Paso de una sustancia desde la sangre hacia el túbulo renal.',br:'Passagem de uma substância do sangue para o túbulo renal.'},
    {key:'diuresis',forms:['diuresis'],es:'Producción y eliminación de orina.',br:'Produção e eliminação de urina.'},
    {key:'natriuresis',forms:['natriuresis'],es:'Eliminación de sodio por la orina.',br:'Eliminação de sódio pela urina.'},
    {key:'siadh',forms:['SIADH'],es:'Exceso de acción de ADH que hace retener agua y puede bajar el sodio de la sangre.',br:'Excesso de ação do ADH que retém água e pode reduzir o sódio do sangue.'},
    {key:'polyuria',forms:['poliuria'],es:'Producción de una cantidad de orina mayor de lo normal.',br:'Produção de uma quantidade de urina maior que o normal.'},
    {key:'oliguria',forms:['oliguria'],es:'Producción de muy poca orina.',br:'Produção de pouca urina.'},
    {key:'anuria',forms:['anuria'],es:'Producción casi nula de orina.',br:'Produção quase nula de urina.'},
    {key:'polydipsia',forms:['polidipsia'],es:'Sed excesiva.',br:'Sede excessiva.'},
    {key:'glycosuria',forms:['glucosuria','glicosúria'],es:'Presencia de glucosa en la orina.',br:'Presença de glicose na urina.'},

    {key:'genotype',forms:['genotipo'],es:'Conjunto de variantes genéticas que tiene una persona.',br:'Conjunto de variantes genéticas que uma pessoa possui.'},
    {key:'phenotype',forms:['fenotipo'],es:'Características observables producidas por los genes y el ambiente.',br:'Características observáveis produzidas pelos genes e pelo ambiente.'},
    {key:'allele',forms:['alelo','alelos'],es:'Una de las versiones posibles de un gen.',br:'Uma das versões possíveis de um gene.'},
    {key:'homozygous',forms:['homocigoto','homozigoto'],es:'Tiene dos alelos iguales para un gen.',br:'Possui dois alelos iguais para um gene.'},
    {key:'heterozygous',forms:['heterocigoto','heterozigoto'],es:'Tiene dos alelos diferentes para un gen.',br:'Possui dois alelos diferentes para um gene.'},
    {key:'dominant',forms:['dominante'],es:'Alelo cuyo efecto puede observarse con una sola copia.',br:'Alelo cujo efeito pode aparecer com apenas uma cópia.'},
    {key:'recessive',forms:['recesivo','recessivo'],es:'Alelo cuyo efecto suele necesitar dos copias para observarse.',br:'Alelo cujo efeito geralmente precisa de duas cópias para aparecer.'},
    {key:'mutation',forms:['mutación','mutação'],es:'Cambio en la secuencia del material genético.',br:'Mudança na sequência do material genético.'},
    {key:'transcription',forms:['transcripción','transcrição'],es:'Copia de la información del ADN a una molécula de ARN.',br:'Cópia da informação do DNA para uma molécula de RNA.'},
    {key:'translation',forms:['traducción','tradução'],es:'Uso de la información del ARN para fabricar una proteína.',br:'Uso da informação do RNA para produzir uma proteína.'},
    {key:'codon',forms:['codón','códon'],es:'Grupo de tres bases del ARN que indica un aminoácido o una señal de parada.',br:'Grupo de três bases do RNA que indica um aminoácido ou um sinal de parada.'},
    {key:'apoptosis',forms:['apoptosis'],es:'Muerte celular programada y controlada.',br:'Morte celular programada e controlada.'},
    {key:'antigen',forms:['antígeno'],es:'Sustancia que el sistema inmunitario puede reconocer.',br:'Substância que o sistema imunológico pode reconhecer.'},
    {key:'antibody',forms:['anticuerpo','anticorpo'],es:'Proteína que reconoce de forma específica un antígeno.',br:'Proteína que reconhece de forma específica um antígeno.'},
    {key:'innate-immunity',forms:['inmunidad innata','imunidade inata'],es:'Defensa rápida y general presente desde el nacimiento.',br:'Defesa rápida e geral presente desde o nascimento.'},
    {key:'adaptive-immunity',forms:['inmunidad adaptativa','imunidade adaptativa'],es:'Defensa específica que aprende y genera memoria.',br:'Defesa específica que aprende e gera memória.'},
    {key:'cytokine',forms:['citocina','citocinas'],es:'Proteína pequeña que permite la comunicación entre células, sobre todo inmunitarias.',br:'Proteína pequena que permite a comunicação entre células, principalmente imunes.'},
    {key:'complement',forms:['sistema del complemento','sistema complemento'],es:'Grupo de proteínas que ayuda a marcar y destruir microorganismos.',br:'Grupo de proteínas que ajuda a marcar e destruir microrganismos.'},
    {key:'opsonization',forms:['opsonización','opsonização'],es:'Marcado de un objetivo para que los fagocitos lo reconozcan y eliminen mejor.',br:'Marcação de um alvo para que os fagócitos o reconheçam e eliminem melhor.'},
    {key:'phagocytosis',forms:['fagocitosis','fagocitose'],es:'Proceso por el que una célula engloba y digiere partículas o microbios.',br:'Processo pelo qual uma célula engloba e digere partículas ou micróbios.'},
    {key:'mhc',forms:['MHC','HLA'],es:'Moléculas que muestran fragmentos de proteínas a los linfocitos T.',br:'Moléculas que apresentam fragmentos de proteínas aos linfócitos T.'},
    {key:'hypersensitivity',forms:['hipersensibilidad','hipersensibilidade'],es:'Respuesta inmunitaria exagerada que puede dañar al propio cuerpo.',br:'Resposta imunológica exagerada que pode lesar o próprio corpo.'},
    {key:'autoimmunity',forms:['autoinmunidad','autoimunidade'],es:'Respuesta del sistema inmunitario contra componentes del propio cuerpo.',br:'Resposta do sistema imunológico contra componentes do próprio corpo.'}
  ];

  var strings = {
    es:{label:'DEFINICIÓN SIMPLE',close:'Cerrar definición',hint:'Toca un término resaltado para ver qué significa.',title:'Ver definición simple'},
    br:{label:'EXPLICAÇÃO SIMPLES',close:'Fechar explicação',hint:'Toque em um termo destacado para ver o significado.',title:'Ver explicação simples'}
  };
  var aliasMap = new Map();
  var aliases = [];
  var activeTrigger = null;
  var popover = null;
  var scanFrame = 0;
  var queuedRoots = new Set();

  function normalize(value){
    return String(value || '').normalize('NFKC').toLocaleLowerCase();
  }

  entries.forEach(function(entry){
    entry.forms.forEach(function(form){
      var normalized = normalize(form);
      if(!aliasMap.has(normalized)) aliases.push(form);
      aliasMap.set(normalized, entry);
    });
  });

  function escapeRegExp(value){
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  aliases.sort(function(a,b){ return b.length - a.length; });
  var glossaryPattern = new RegExp('(^|[^\\p{L}\\p{N}])(' + aliases.map(escapeRegExp).join('|') + ')(?=$|[^\\p{L}\\p{N}])','giu');

  function currentLang(){
    var selected = document.getElementById('classLanguageSelect') || document.getElementById('communityLanguage');
    var candidates = [
      selected && selected.value,
      document.body && document.body.dataset.lang,
      document.documentElement.lang
    ];
    try{ candidates.unshift(localStorage.getItem('medLang')); }catch(error){}
    for(var i=0;i<candidates.length;i+=1){
      var value = String(candidates[i] || '').toLowerCase();
      if(value === 'br' || value.indexOf('pt') === 0) return 'br';
      if(value === 'es' || value.indexOf('es-') === 0) return 'es';
    }
    return 'es';
  }

  function injectStyles(){
    if(document.getElementById('mnMedicalGlossaryStyles')) return;
    var style = document.createElement('style');
    style.id = 'mnMedicalGlossaryStyles';
    style.textContent =
      '.mn-glossary-term{display:inline!important;width:auto!important;min-width:0!important;min-height:0!important;margin:0;padding:0 .08em;border:0;border-radius:.22em;background:rgba(97,218,251,.08);color:inherit;border-bottom:1.5px dotted currentColor;font:inherit;font-weight:800;line-height:inherit;letter-spacing:inherit;text-align:inherit;white-space:normal;vertical-align:baseline;box-shadow:none!important;cursor:pointer;touch-action:manipulation;-webkit-appearance:none;appearance:none;-webkit-tap-highlight-color:transparent;box-decoration-break:clone;-webkit-box-decoration-break:clone}' +
      '.mn-glossary-term:hover,.mn-glossary-term:focus-visible,.mn-glossary-term[aria-expanded="true"]{background:rgba(97,218,251,.18);outline:none;box-shadow:0 0 0 2px rgba(97,218,251,.3)}' +
      '.mn-glossary-popover{position:fixed;z-index:2147483000;width:max-content;max-width:min(350px,calc(100vw - 20px));padding:13px 42px 13px 14px;border:1px solid rgba(111,211,244,.42);border-radius:15px;background:#071321;color:#f7fbff;box-shadow:0 18px 48px rgba(0,0,0,.48);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;line-height:1.42;text-align:left;overflow-wrap:anywhere}' +
      '.mn-glossary-popover[hidden]{display:none}' +
      '.mn-glossary-popover::after{content:"";position:absolute;left:var(--mn-arrow-left,50%);width:10px;height:10px;background:#071321;border-right:1px solid rgba(111,211,244,.42);border-bottom:1px solid rgba(111,211,244,.42);transform:translateX(-50%) rotate(45deg)}' +
      '.mn-glossary-popover[data-placement="above"]::after{bottom:-6px}' +
      '.mn-glossary-popover[data-placement="below"]::after{top:-6px;transform:translateX(-50%) rotate(225deg)}' +
      '.mn-glossary-label{display:block;margin:0 0 4px;color:#76dcfb;font-size:10px;font-weight:900;letter-spacing:.13em}' +
      '.mn-glossary-title{display:block;margin:0 0 3px;color:#ffe19a;font-size:15px;font-weight:850}' +
      '.mn-glossary-definition{display:block;color:#eef5fc}' +
      '.mn-glossary-close{position:absolute;top:7px;right:7px;display:grid;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font:700 20px/1 system-ui;cursor:pointer;touch-action:manipulation}' +
      '.mn-glossary-close:hover,.mn-glossary-close:focus-visible{background:rgba(255,255,255,.18);outline:2px solid #76dcfb;outline-offset:1px}' +
      '@media(max-width:480px){.mn-glossary-popover{max-width:calc(100vw - 16px);padding:11px 40px 11px 12px;border-radius:13px;font-size:13px;line-height:1.38}.mn-glossary-title{font-size:14px}.mn-glossary-close{top:5px;right:5px;width:36px;height:36px}.mn-glossary-term{padding:0 .05em}}' +
      '@media(prefers-reduced-motion:no-preference){.mn-glossary-popover:not([hidden]){animation:mnGlossaryIn .14s ease-out}@keyframes mnGlossaryIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}}';
    document.head.appendChild(style);
  }

  function ensurePopover(){
    if(popover && popover.isConnected) return popover;
    popover = document.createElement('aside');
    popover.id = POPOVER_ID;
    popover.className = 'mn-glossary-popover';
    popover.setAttribute('role','dialog');
    popover.setAttribute('aria-modal','false');
    popover.setAttribute('aria-live','polite');
    popover.hidden = true;

    var label = document.createElement('span');
    label.className = 'mn-glossary-label';
    label.id = POPOVER_ID + 'Label';
    var title = document.createElement('strong');
    title.className = 'mn-glossary-title';
    title.id = POPOVER_ID + 'Title';
    var definition = document.createElement('span');
    definition.className = 'mn-glossary-definition';
    definition.id = POPOVER_ID + 'Definition';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'mn-glossary-close';
    close.textContent = '×';
    close.addEventListener('click',function(event){
      event.preventDefault();
      closePopover(true);
    });
    popover.appendChild(label);
    popover.appendChild(title);
    popover.appendChild(definition);
    popover.appendChild(close);
    popover.setAttribute('aria-labelledby', title.id);
    popover.setAttribute('aria-describedby', definition.id);
    document.body.appendChild(popover);
    return popover;
  }

  function positionPopover(){
    if(!activeTrigger || !popover || popover.hidden) return;
    var triggerRect = activeTrigger.getBoundingClientRect();
    if(triggerRect.bottom < 0 || triggerRect.top > window.innerHeight){
      closePopover(false);
      return;
    }
    var margin = 8;
    var gap = 9;
    var popRect = popover.getBoundingClientRect();
    var left = triggerRect.left + triggerRect.width / 2 - popRect.width / 2;
    left = Math.max(margin,Math.min(window.innerWidth - popRect.width - margin,left));
    var above = triggerRect.top - popRect.height - gap;
    var placement = above >= margin ? 'above' : 'below';
    var top = placement === 'above' ? above : Math.min(window.innerHeight - popRect.height - margin,triggerRect.bottom + gap);
    var arrow = triggerRect.left + triggerRect.width / 2 - left;
    arrow = Math.max(15,Math.min(popRect.width - 15,arrow));
    popover.dataset.placement = placement;
    popover.style.left = Math.round(left) + 'px';
    popover.style.top = Math.round(Math.max(margin,top)) + 'px';
    popover.style.setProperty('--mn-arrow-left',Math.round(arrow) + 'px');
  }

  function closePopover(returnFocus){
    if(!popover || popover.hidden) return;
    var previous = activeTrigger;
    if(previous) previous.setAttribute('aria-expanded','false');
    popover.hidden = true;
    activeTrigger = null;
    if(returnFocus && previous && previous.isConnected) previous.focus({preventScroll:true});
  }

  function openPopover(trigger){
    var entry = entries.find(function(item){ return item.key === trigger.dataset.glossaryKey; });
    if(!entry) return;
    if(activeTrigger === trigger && popover && !popover.hidden){
      closePopover(false);
      return;
    }
    if(activeTrigger) activeTrigger.setAttribute('aria-expanded','false');
    var lang = currentLang();
    var copy = strings[lang];
    var panel = ensurePopover();
    trigger.setAttribute('title',copy.title);
    panel.querySelector('.mn-glossary-label').textContent = copy.label;
    panel.querySelector('.mn-glossary-title').textContent = trigger.textContent.trim();
    panel.querySelector('.mn-glossary-definition').textContent = entry[lang];
    var close = panel.querySelector('.mn-glossary-close');
    close.setAttribute('aria-label',copy.close);
    close.setAttribute('title',copy.close);
    activeTrigger = trigger;
    trigger.setAttribute('aria-expanded','true');
    panel.hidden = false;
    positionPopover();
  }

  function createTrigger(term,entry){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mn-glossary-term';
    button.dataset.glossaryKey = entry.key;
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls',POPOVER_ID);
    button.setAttribute('aria-expanded','false');
    button.setAttribute('title',strings[currentLang()].title);
    button.textContent = term;
    return button;
  }

  function shouldSkip(node){
    var parent = node.parentElement;
    if(!parent || !node.nodeValue || !node.nodeValue.trim()) return true;
    if(parent.closest('script,style,noscript,textarea,input,select,option,button,a,label,summary,code,pre,kbd,samp,svg,math,[contenteditable="true"],[data-no-glossary],[aria-hidden="true"],.mn-abbr,.mn-glossary-term,.mn-glossary-popover')) return true;
    glossaryPattern.lastIndex = 0;
    return !glossaryPattern.test(node.nodeValue);
  }

  function decorateTextNode(node){
    var text = node.nodeValue || '';
    glossaryPattern.lastIndex = 0;
    var last = 0;
    var match;
    var fragment = document.createDocumentFragment();
    var changed = false;
    while((match = glossaryPattern.exec(text))){
      var prefix = match[1] || '';
      var term = match[2];
      var start = match.index + prefix.length;
      var entry = aliasMap.get(normalize(term));
      if(!entry) continue;
      if(start > last) fragment.appendChild(document.createTextNode(text.slice(last,start)));
      fragment.appendChild(createTrigger(term,entry));
      last = start + term.length;
      changed = true;
    }
    if(!changed) return;
    if(last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)));
    if(node.parentNode) node.parentNode.replaceChild(fragment,node);
  }

  function scan(root){
    var scope = root && root.nodeType ? root : document;
    var roots = [];
    if(scope.nodeType === Node.DOCUMENT_NODE){
      roots = Array.from(document.querySelectorAll('main,dialog'));
    }else if(scope.matches && scope.matches('main,dialog')){
      roots = [scope];
    }else if(scope.closest && scope.closest('main,dialog')){
      roots = [scope];
    }else if(scope.querySelectorAll){
      roots = Array.from(scope.querySelectorAll('main,dialog'));
    }
    roots.forEach(function(item){
      if(!item.isConnected || item.closest('.mn-glossary-popover')) return;
      var walker = document.createTreeWalker(item,NodeFilter.SHOW_TEXT,{
        acceptNode:function(node){ return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
      });
      var nodes = [];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(decorateTextNode);
    });
  }

  function queueScan(root){
    if(root) queuedRoots.add(root);
    if(scanFrame) return;
    scanFrame = window.requestAnimationFrame(function(){
      scanFrame = 0;
      var batch = Array.from(queuedRoots);
      queuedRoots.clear();
      if(!batch.length) batch = [document];
      batch.forEach(scan);
    });
  }

  function bindEvents(){
    document.addEventListener('click',function(event){
      var trigger = event.target && event.target.closest && event.target.closest('.mn-glossary-term');
      if(trigger){
        event.preventDefault();
        event.stopPropagation();
        try{ trigger.focus({preventScroll:true}); }catch(error){ trigger.focus(); }
        openPopover(trigger);
        return;
      }
      if(popover && !popover.hidden && !event.target.closest('.mn-glossary-popover')) closePopover(false);
    },true);
    document.addEventListener('keydown',function(event){
      if(event.key === 'Escape') closePopover(true);
    });
    window.addEventListener('resize',positionPopover,{passive:true});
    window.addEventListener('scroll',positionPopover,{passive:true,capture:true});
    ['classLanguageSelect','communityLanguage'].forEach(function(id){
      var select = document.getElementById(id);
      if(select) select.addEventListener('change',function(){ closePopover(false); });
    });
    var observer = new MutationObserver(function(records){
      records.forEach(function(record){
        record.addedNodes.forEach(function(node){
          if(node.nodeType === Node.ELEMENT_NODE && !node.closest('.mn-glossary-popover')) queueScan(node);
          if(node.nodeType === Node.TEXT_NODE && node.parentElement && node.parentElement.closest('main,dialog')) queueScan(node.parentElement);
        });
      });
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function start(){
    injectStyles();
    ensurePopover();
    scan(document);
    bindEvents();
    document.documentElement.dataset.medicalGlossary = 'ready';
  }

  window.MedNykutoGlossary = {
    version:VERSION,
    entryCount:entries.length,
    scan:scan,
    open:function(key){
      var trigger = document.querySelector('.mn-glossary-term[data-glossary-key="' + key + '"]');
      if(trigger) openPopover(trigger);
    },
    close:function(){ closePopover(false); }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
