const {Suggestions, BasicCard} = require('actions-on-google');
const {Suggestion, Card} = require("dialogflow-fulfillment");
const {WebhookClient,Image}=require("dialogflow-fulfillment");
const { request, response, text } = require("express");
const express=require("express");
const app=express();
const nodemailer = require("nodemailer");
const hotel_details=require('./hotels');
const resturant=require("./resturant")
const fs = require('fs')

//database connection

var admin = require("firebase-admin");

var serviceAccount = require("./config/test-bot-ruqu-firebase-adminsdk-gppu3-2bb7422b4c.json"); //db config file path
const { error } = require('actions-on-google/dist/common');

try{
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://test-bot-ruqu-default-rtdb.firebaseio.com/" //db url
      });            
}
catch{
    console.log("database disconnected")
}



// dialogflow app pr post ki request bhejegaa

app.get("/",(req,res)=>{
    res.sendFile('index.html',{root:__dirname});
})


app.post("/webhook",express.json(),(request,response)=>{                                          //fulfillment mai bhi url mai /webhook lagana huga 
    const agent=new WebhookClient({request:request,response:response});
    
    

    function fallback(agent){
        agent.add(`Hi, I am Giftty. I can help you to find idea for occasion that you will be celebrating. From Wedding anniversary to birthday`);
            agent.add(new Suggestion("Wedding aniversary"))
            agent.add(new Suggestion("Birthday"))
            agent.add(new Suggestion("Not intrested.")) 
    }



    function sendmail(emailtosent){

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: 'faizsarwar856@gmail.com',  //add your email
                pass: 'perfectcup'               //add your password
            }
        });

        var mailOptions={
            from: 'faizsarwar856@gmail.com',
            to : emailtosent,
            suject: 'giffyBot',
            text: 'hello from giffy bot'
        };

        return new Promise(function (resolve, reject){
           transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                 console.log("error: ", err);
                 reject(err);
              } else {
                 console.log(`Mail sent successfully!`);
                 resolve(info);
              }
           });
        });
     }

    

    //insert data into db
    async function welcome(agent){
           
            let name=agent.parameters["person"];
            let email=agent.parameters["email"];     
            let location=agent.parameters["any"];
            let latitude=agent.parameters["any11"];
            let longitude=agent.parameters["any33"];


            jsonobject={
                "name":name,
                "email":email
            }
            await sendmail("faizsarwar44@gmail.com").then(()=>{
                emailsend=true;
                insert_data(jsonobject)

            }).catch((e)=>{
                emailsend==false;
                agent.add("email not send")
            })

            agent.add(`Hi, I am Giftty. I can help you to find idea for occasion that you will be celebrating. From Wedding anniversary to birthday`);
            agent.add(new Suggestion("Wedding aniversary"))
            agent.add(new Suggestion("Birthday"))
            agent.add(new Suggestion("Not intrested."))
            hotel_details.get_details(location).then((details)=>{
            fs.writeFileSync('./hotelinfo.txt',  `${details}`, err => {
                    if (err) {
                      console.error(err)
                    }
                    //file written successfully
                  })
            })
            console.log("welcome")
            resturant.get_resturants(latitude,longitude).then((details)=>{ 
                fs.writeFileSync('./resturantinfo.txt',  `${details}`, err => {
                if (err) {
                  console.error(err)
                }
                //file written successfully
              })
              })
           
           }

    function show_option_chips(agent){
        agent.add("We have some amazing idea on Staycation, Romantic Dinner, Jewellery and those were the days which one do you prefer ?")
        agent.add(new Suggestion("Staycation"))
        agent.add(new Suggestion("Romantic Dinner"))
        agent.add(new Suggestion("Jewellery"))        
    }

   
    //fecthng from database
    function getfromfirebase(key){  //added
        return admin.database().ref(key).once("value").then((snapshot)=>{    //fetching value of key 
                snapshot.val();
        })
    }
  
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    //adding in a database 
    function insert_data(customer){
        return admin.database().ref("/users").push({
            customer
        }).then((snapshot)=>{
            console.log("sucessfuly write into db"+snapshot.ref.toString());

        }).catch();
       
    }
    async function Staycation(agent){
        // let location = agent.parameters["any"];
        var x;
        fs.readFile('./hotelinfo.txt', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            console.log(data);
            x=data.split(",")
            });
            await delay(1500)
        agent.add("These are few hotels listed in your area")
        agent.add(new Card({
            title: x[0],
            text: `hotel contact is ${x[1]}`,
        }));
        agent.add(new Card({
            title: x[2],
            text: `hotel contact is ${x[3]}`,
        }))
        agent.add(new Card({
            title: x[4],
            text: `hotel contact is ${x[5]}`,
        }))
        // console.log(x)  
    }

    async function Romantic_Dinner(agent){      
         var x;
        fs.readFile('./resturantinfo.txt', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            console.log(data);
            x=data.split(",")
            });
            await delay(1500)      
            agent.add("These are few best resturants listed in your area")
            agent.add(new Card({
                title: x[0],
                text: `rating is : ${x[1]}`,
            }));
            agent.add(new Card({
                title: x[2],
                text: `rating is : ${x[3]}`,
            }))
            agent.add(new Card({
                title: x[4],
                text: `rating is : ${x[5]}`,
            }))

    }

    let intentMap= new Map();
    intentMap.set("Default Fallback Intent",fallback);    //ju name intent ka dailog flow ai huga whi dena hai ,ju function call krwana hai wo
    intentMap.set("Intro",welcome);
    // intentMap.set("getadress",getfromfirebase);  //added
    intentMap.set("Wedding Anniversary",show_option_chips);
    intentMap.set("Birthday",show_option_chips);
    intentMap.set("Staycation",Staycation);
    intentMap.set("Romantic Dinner",Romantic_Dinner);


    agent.handleRequest(intentMap)
})

const port = process.env.PORT || 4000;

app.listen(port,()=>{
    console.log("server is up on 4000");
})