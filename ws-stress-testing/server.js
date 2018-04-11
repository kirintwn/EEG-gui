const WebSocketServer = require("uws").Server;

class Server {
    constructor() {
        this.port = process.env.PORT || 9999;
        this.channelNum = Number(process.env.CH) || 64;
        this.msgCount = {
            RAW: 0,
            DEC: 0,
            FFT: 0
        };
        this.tick = 0;
        this.coefficient = 0;
        this.fftFakeData = Array(this.channelNum).fill(Array(5000).fill(0));
        this.rawEvent = false;
        this.decEvent = false;

        this.mockLoop();
        this.wss = this.initServer();
        this.setHandler();
        this.printMsgCount();
    }

    mockLoop() {
        const mainLoop = () => {
            setTimeout(mainLoop, 1);
            this.tick += 1;
            this.coefficient += 0.01;
        }
         
        const eventLoop = () => {
            setTimeout(eventLoop, 5000);
            this.rawEvent = true;
            this.decEvent = true;
        }

        setTimeout(mainLoop, 1);
        setTimeout(eventLoop, 5000);
    }

    initServer() {
        let wss = new WebSocketServer({ port: this.port }, () => {
            console.log(`Server is up on ${this.port}`);
        });

        return wss;
    }

    setHandler() {
        this.wss.on("connection", (ws) => {
            this.sendRAW(ws);
            this.sendDEC(ws);
            this.sendFFT(ws);
        });
    }

    sendRAW(ws) {
        const sendOneRAW = () => {
            setTimeout(sendOneRAW, 1);
            this.msgCount.RAW += 1;
            ws.send(JSON.stringify(this.genPacket("RAW")));
        }
        setTimeout(sendOneRAW, 1);
    }

    sendDEC(ws) {
        const sendOneDEC = () => {
            setTimeout(sendOneDEC, 4);
            this.msgCount.DEC += 1;
            ws.send(JSON.stringify(this.genPacket("DEC")));
        }
        setTimeout(sendOneDEC, 4);
    }

    sendFFT(ws) {
        const sendOneFFT = () => {
            setTimeout(sendOneFFT, 5000);
            this.msgCount.FFT += 1;
            ws.send(JSON.stringify(this.genPacket("FFT")));
        }
        setTimeout(sendOneFFT, 5000);
    }

    genPacket(type) {
        if(type === "RAW") {
            let currentEvent = null;
            if(this.rawEvent) {
                currentEvent = {
                    name: "testEvent@" + this.tick.toString(),
                    duration: 10
                }
                this.rawEvent = false;
            }
            return {
                name: "raw",
                type: "raw",
                tick: this.tick,
                data: {
                    eeg: Array(this.channelNum).fill(Math.sin(this.coefficient)),
                    event: currentEvent
                }
            };
        }
        else if(type === "DEC") {
            let currentEvent = null;
            if(this.decEvent) {
                currentEvent = {
                    name: "testEvent@" + this.tick.toString(),
                    duration: 10
                }
                this.decEvent = false;
            }
            return {
                name: "dec",
                type: "raw",
                tick: this.tick,
                data: {
                    eeg: Array(this.channelNum).fill(Math.sin(this.coefficient)),
                    event: currentEvent
                }
            };
        }
        else if(type === "FFT") {
            return {
                name: "fft",
                type: "fft",
                startTick: this.tick - 4999,
                endTick: this.tick,
                data: this.fftFakeData
            }
        }
        else {
            console.log("Type err: ", type);
        }
    }

    printMsgCount() {
        setInterval(() => {
            console.log("msgCount: ", this.msgCount);
            this.msgCount.RAW = 0;
            this.msgCount.DEC = 0;
            this.msgCount.FFT = 0;
        }, 1000);
    }
};

let myServer = new Server();