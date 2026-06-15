# Asynchronous Order Processing System (Node.js & RabbitMQ)

A production-grade, decoupled e-commerce microservice architecture built with Node.js, Express, and RabbitMQ (via CloudAMQP). This project demonstrates how to handle high-traffic spikes, ensure message durability, and create a highly fault-tolerant backend system where API endpoints remain fast and responsive even when background processing units fail.

---

## 🏗️ System Architecture

Unlike traditional synchronous APIs where the user waits for database writes, payment processing, or emails to finish, this system uncouples the client request from the execution work.



1. **Producer (Express API Server):** Listens for incoming orders at `POST /order`. It performs fast schema validation, wraps the order data into a message payload, dumps it into RabbitMQ, and returns an instant `202 Accepted` status code to the client.
2. **Message Broker (CloudAMQP):** Hosts a durable `order_queue` in the cloud, acting as a buffer that securely stores order payloads until resources are ready to process them.
3. **Consumer (Background Worker):** A lightweight background service that pulls messages off the queue sequentially, processes them (simulating database transactions or shipping logs), and acknowledges successful completion.

---

## 🛡️ Production-Grade Resiliency Features

This architecture implements three core Enterprise Integration Patterns to guarantee zero data loss:

* **Queue and Message Durability (`durable: true`, `persistent: true`):** The queue configuration and messages are written directly to disk on the broker. If the cloud instance restarts or undergoes unexpected power loss, your customer data remains perfectly intact.
* **Manual Message Acknowledgments (`noAck: false`):** Messages are never automatically removed when delivered. The worker must explicitly trigger `channel.ack(msg)` *after* processing is complete. If the worker crashes or loses network connectivity mid-transaction, RabbitMQ notices the dropped connection and automatically re-queues the message for another worker.
* **Fair Dispatch / Competing Consumers (`channel.prefetch(1)`):** Prevents a single worker instance from getting bottlenecked. By setting the prefetch limit to `1`, RabbitMQ will not hand a worker a new message until it acknowledges its current active assignment. This allows you to scale by spinning up 5 separate workers that distribute the workload perfectly.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+ or portable prebuilt binary extracted locally)
* A free account and instance URL on [CloudAMQP](https://www.cloudamqp.com/)

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name

2. Install dependencies:
    npm install amqplib express
3. Update the CLOUD_AMQP_URL variable at the top of both publisher.js and worker.js with your specific instance URL.