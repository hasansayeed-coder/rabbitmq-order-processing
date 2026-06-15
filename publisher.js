require('dotenv').config();

const express = require('express') ; 
const amqp = require('amqplib') ;

const app = express(); 
app.use(express.json()) ; 

const QUEUE_NAME = 'order_queue' ; 
let channel ; 

const CLOUD_AMQP_URL = process.env.CLOUD_AMQP_URL ; 


// 1. Connect to RabbitMQ
async function connectRabbitMQ(){
    try{
        const connection = await amqp.connect(CLOUD_AMQP_URL) ; 
        channel = await connection.createChannel() ; 

        // assert  queue makes sure the queue exists. durable : true survives restarts!
        await channel.assertQueue(QUEUE_NAME , { durable : true}) ; 

        console.log("⚡ Connected to RabbitMQ successfully");
    }catch(error){
        console.error("❌ Failed to connect to CloudAMQP", error);
    }
}

connectRabbitMQ() ;

// 2. API endpoint to receive orders
app.post('/order' , async(req , res) => {
    const order = req.body ; 

    try{

        //send message to queue
        // persistent : true saves messages to disk so it's not lost if RabbitMQ crashes.

        channel.sendToQueue(QUEUE_NAME , Buffer.from(JSON.stringify(order)) , {
            persistent : true
        }) ;
        return res.status(202).json({
            message : 'Order accepted and queueing  for processing'
        })
    }catch(error){
        return res.status(500).json({
            error : "Failed to place order to queue"
        }) ; 
    }
})

app.listen(3000 , () => {
    console.log("🚀 API Server running on port 3000")
})