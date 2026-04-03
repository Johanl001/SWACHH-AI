// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import mqtt from 'mqtt';

const MQTT_BROKER = "ws://PLACEHOLDER_MQTT_BROKER:9001";
let client = null;

export const connectMQTT = () => {
    try {
        client = mqtt.connect(MQTT_BROKER);
        client.on('connect', () => {
            console.log("MQTT connected to WebSocket");
        });
        client.on('error', (err) => {
            console.error("MQTT Error: ", err);
        });
    } catch (error) {
        console.error("Failed to connect MQTT: ", error);
    }
};

export const subscribeToBinUpdates = (callback) => {
    if (!client) connectMQTT();
    client.subscribe(['swachh/bin_status', 'swachh/alert'], (err) => {
        if (!err) {
            client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    callback(topic, data);
                } catch (e) {
                    console.error("Error parsing MQTT msg", e);
                }
            });
        }
    });
};

export const publishUserScan = (payload) => {
    if (!client) return;
    try {
        client.publish("swachh/user_reward", JSON.stringify(payload), { qos: 1 });
    } catch (e) {
        console.error("Pub error", e);
    }
};
