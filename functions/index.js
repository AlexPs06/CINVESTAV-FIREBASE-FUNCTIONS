// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const sgMail = require('@sendgrid/mail');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
process.env.SENDGRID_API_KEY = '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';


const firebaseConfig = {
  apiKey: "AIzaSyCfsNVhrr-acJ246R23wx-YVUIVcY86WQc",
  authDomain: "cinvestavchatbot.firebaseapp.com",
  databaseURL: "https://cinvestavchatbot.firebaseio.com",
  projectId: "cinvestavchatbot",
  storageBucket: "cinvestavchatbot.appspot.com",
  messagingSenderId: "984782490625",
  appId: "1:984782490625:web:d25814930229b6f6900400"
};



exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function sendEmail(agent) {    
    const emailParam = agent.parameters.email;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: emailParam,
      from: 'luis.pesar@gmail.com',
      subject: 'Sending with Twilio SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    console.log(msg);
    sgMail.send(msg);
    

    agent.add("Conserva la calma te recomiendo ir con el psicologo");

}
 function insertarExamen(agent) {
  admin.initializeApp(firebaseConfig);

    const clase = agent.parameters.clases;
    const hora = agent.parameters.hora;
    const dia = agent.parameters.dia;
    const grado = agent.parameters.grupo;
    const grupo = agent.parameters.grado;
    var data ={
      'clase': clase,
      'hora': hora,
      'dia': dia,
      'grupo':grupo,
      'grado':grado
    };

    admin.database().ref("Examenes").push(data)
    // admin.firestore().collection('Examenes').add(data).then(response=>{
    // return console.log("acabe") 
    // }).catch(err =>{
    //   return console.log(err)
    // });
    agent.add('se ah añadido la fecha del nuevo examen con exito, el nuevo examen de '+clase+ 'del '+grado+'grado grupo'+grupo+', sera el día '+dia+' a las '+hora );
}
function insertarMaterial(agent) {
  admin.initializeApp(firebaseConfig);

  const clase = agent.parameters.clases;
  const url = agent.parameters.url;
  const codigo = agent.parameters.codigo;
  var data={
    'clase': clase,
    'url': url,
    'codigo': codigo,
  };
  console.log(clase) 
  console.log(url) 
  console.log(codigo) 

  admin.database().ref("Material").push(data)
  // admin.firestore().collection("Materiales").add(data).then(response=>{
  //   return console.log("acabe") 
  // }).catch(err =>{
  //   return console.log(err)
  // });

  // .doc('prueba').set(data);

 

  agent.add('se ah añadido un nuevo material a la clase de '+clase+" con el código: "+codigo+" es la url de "+url );
}

  let intentMap = new Map();
  intentMap.set('Enviar-correo', sendEmail);
  intentMap.set('Añadir-examen', insertarExamen);
  intentMap.set('Añadir-material-clase', insertarMaterial);
  agent.handleRequest(intentMap);
});
