class PeerService {
    constructor() {
        this.init();
    }

    init() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ]
                }
            ]
        });
    }

    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            return answer;
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            return offer;
        }
    }

    async setRemoteDescription(answer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(answer); 
        }
    }

    async getMediaStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.stream = stream;
            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    }

    async addLocalStream() {
        if(this.stream)  {
            this.stream.getTracks().forEach(track => this.peer.addTrack(track, this.stream));
        }
    }

    reset() {
        if (this.peer) {
            this.peer.getSenders().forEach(sender => this.peer.removeTrack(sender));
            this.peer.close();
            this.init(); 
        }
    }
}

export default new PeerService();
