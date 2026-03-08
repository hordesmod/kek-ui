import log from "./logger"

class SoundManager {
    constructor() {
        this.myAudioContext = new AudioContext()
        this.volume = 50

        this.melodies = {
            H_2_1: [[50, 784, 80], [50, 988, 80]],
            H_2_2: [[50, 659, 80], [50, 880, 80]],
            L_2_1: [[50, 392, 80], [50, 494, 80]],
            L_2_2: [[50, 329, 80], [50, 440, 80]],
            H_3_1: [[50, 784, 80], [50, 988, 80], [50, 1174, 80]],
            H_3_2: [[50, 659, 80], [50, 784, 80], [50, 988, 80]],
            L_3_1: [[50, 392, 80], [50, 440, 80], [50, 494, 80]],
            L_3_2: [[50, 329, 80], [50, 392, 80], [50, 440, 80]],
            H_4_1: [[50, 784, 80], [50, 880, 80], [50, 988, 80], [50, 1047, 80]],
            H_4_2: [[50, 659, 80], [50, 784, 80], [50, 880, 80], [50, 988, 80]],
            L_4_1: [[50, 392, 80], [50, 440, 80], [50, 494, 80], [50, 523, 80]],
            L_4_2: [[50, 329, 80], [50, 392, 80], [50, 440, 80], [50, 494, 80]]
        }

    }
    getMelodies(){
        return Object.keys(this.melodies)
    }

    note(duration, frequency, volume) {
        return new Promise((resolve, reject) => {
            duration = duration || 200
            frequency = frequency || 440
            volume = (volume || 100) * this.volume

            try {
                let oscillatorNode = this.myAudioContext.createOscillator()
                let gainNode = this.myAudioContext.createGain()
                oscillatorNode.connect(gainNode)

                oscillatorNode.frequency.value = frequency

                oscillatorNode.type = "square"
                gainNode.connect(this.myAudioContext.destination)

                gainNode.gain.value = volume * 0.01

                oscillatorNode.start(this.myAudioContext.currentTime)
                oscillatorNode.stop(this.myAudioContext.currentTime + duration * 0.001)

                oscillatorNode.onended = () => {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    setVolume(volume) {
        this.volume = volume / 100
    }

    play(noteSequence = "L_4_2") {
        if (noteSequence == 0) return
        return this.melodies[noteSequence].reduce((promise, note) => {
            return promise.then(() => this.note(note[0], note[1], note[2]))
        }, Promise.resolve())
    }
    
}

const soundManager = new SoundManager()


export default soundManager