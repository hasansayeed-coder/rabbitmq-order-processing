

require('dotenv').config();
const CLOUD_AMQP_URL = process.env.CLOUD_AMQP_URL ; 

const amqp = require('amqplib') ; 
const QUEUE_NAME = 'order_queue' ; 



async function startWorker(){

    try{

        const connection = await amqp.connect(CLOUD_AMQP_URL) ; 
        const channel = await connection.createChannel() ; 


        await channel.assertQueue(QUEUE_NAME , {durable : true}) ; 

        channel.prefetch(1) ; 
        console.log("Worker is waiting for cloud messages") ; 

        channel.consume(QUEUE_NAME , (msg) =>{
            if(msg !== null){
                const order = JSON.parse(msg.content.toString()) ; 
                console.log(`Processing order ID : ${order.id} for ${order.item}`) ; 

                setTimeout(() => {

                    console.log(`✅ Successfully processed order: ${order.id}`);

                    // CRITICAL: Acknowledge that the message is safely processed!
                    channel.ack(msg) ;
                } , 3000) ; 
            }
        } , {noAck : false});
    }catch(error){
        console.error("Worker Error " , error) ;    
    }
}

startWorker() ; 