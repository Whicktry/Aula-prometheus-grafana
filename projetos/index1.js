# criando uma apliação para ser monitorada

var express = require('express');
var prom = require('prom-client');
const register = prom.register;

var app = express();

const counter = new prom.Counter({
  name: 'aula_request_total',
  help: 'contador de requests',
  labelNames: ['statusCode']
});

const gauge = new prom.Gauge({ 
    name: 'aula_free_bytes', 
    help: 'exemplo de gauge' 
});

const histogram = new prom.Histogram({
    name: 'aula_request_time_seconds',
    help: 'Tempo de resposta da API',
    buckets: [0.1, 0.2, 0.3, 0.4, 0.5],
  });

  const summary = new prom.Summary({
    name: 'aula_request_summary_time_seconds',
    help: 'tempo de resposta da API',
    percentiles: [0.5, 0.9, 0.99],
  });

app.get('/', function(req, res) {
    counter.labels('300').inc();
    counter.labels('200').inc();
    gauge.set(100*Math.random());
    const tempo = Math.random();
    histogram.observe(tempo);
    summary.observe(tempo);


    res.send('Hellow World!');
});

app.get('/metrics', async function(req, res){
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
})

app.listen(5000);
