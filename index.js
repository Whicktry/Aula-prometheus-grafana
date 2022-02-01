var express = require('express');
var prom = require('prom-client');
const register = prom.register;

var app = express();

const contadorRequisicoes = new prom.Counter({
  name: 'aula_request_total',
  help: 'contador de requests',
  labelNames: ['statusCode']
});

const usuariosOnline = new prom.Gauge({ 
    name: 'aula_usuarios_logados_total', 
    help: 'Números de usuários logados no momento' 
});

const tempoDeResposta = new prom.Histogram({
    name: 'aula_request_duration_seconds',
    help: 'Tempo de resposta da API',
  });

  const summary = new prom.Summary({
    name: 'aula_request_summary_time_seconds',
    help: 'tempo de resposta da API',
    percentiles: [0.5, 0.9, 0.99],
  });

function randn_bm(min, max, skew) {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();//converting (0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    
    num = num / 10.0 + 0.5; //translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); //resample between
    num = Math.pow(num, skew); //skew
    num *= max  - min; //stretch to fill range
    num += min; //offset to min
    return num;
}

setInterval(() => {
  // Incrementar contador
  var taxaDeErro = 5;
  var statusCode = (Math.random() < taxaDeErro/100) ? '500' : '200';
  contadorRequisicoes.labels(statusCode).inc(); 

  // Atualiza gauge
  usuariosOnline.set(500 + Math.round((50 * Math.random())));
  
  // Observa tempo de resposta
  var tempoObservado = randn_bm(0, 3, 4);
  tempoDeResposta.observe(tempoObservado);

}, 1000);

app.get('/', function(req, res) {
    res.send('Hellow World!');
});

app.get('/metrics', async function(req, res){
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
})

app.listen(5000);