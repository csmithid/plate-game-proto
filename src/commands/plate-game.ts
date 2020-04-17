import { GluegunCommand, prompt, print } from 'gluegun'
import { GluegunEnquirer } from 'gluegun/build/types/toolbox/prompt-types'
import * as _ from 'lodash'
import * as stringMath from 'string-math'

const MIN_NUMBERS: number = 3

class GameObject {
  public plate?: string
  public numbers?: number[]
  private workingResult?: number

  public constructor(plate: string) {
    this.plate = plate
    this.numbers = getNumbersFromString(this.plate)
    this.workingResult = null
  }

  public async loop() {
    while (this.workingResult !== 0) {
      if (this.numbers.length < 2) {
        print.info("Uh oh! You're out of numbers. Try again!")
        this.numbers = getNumbersFromString(this.plate)
      }

      const response: GluegunEnquirer = await prompt.ask({
        type: 'input',
        name: 'math',
        message: `Do some math with the numbers ${this.numbers}. Try to reach zero!`
      })

      let math: string = response.math
      this.workingResult = stringMath(math)

      if (_.isEqual(getNumbersFromString(math), this.numbers)) {
        this.numbers = getNumbersFromString(this.workingResult.toString())
        print.info(`The result is ${this.workingResult}`)
      } else {
        print.info('Only use the numbers from the license plate!')
      }
    }
  }
}

function getNumbersFromString(plate: string): number[] {
  let numbersFromString: number[] = []
  for (let char of plate) {
    let int: number = parseInt(char)
    if (!isNaN(int)) {
      numbersFromString.push(int)
    }
  }
  return numbersFromString.sort()
}

async function askForPlate() {
  let plate: string = ''
  do {
    const response: GluegunEnquirer = await prompt.ask({
      type: 'input',
      name: 'plate',
      message: 'What is the license plate?'
    })

    if (response.plate === '') {
      print.info('A license plate is required.')
    } else if (getNumbersFromString(response.plate).length < MIN_NUMBERS) {
      print.info(
        'Try a longer license plate - you need at least 3 numbers to work with!'
      )
    } else {
      plate = response.plate
    }
  } while (plate === '')

  return plate
}

const command: GluegunCommand = {
  name: 'plate-game',
  run: async () => {
    let plate: string = await askForPlate()
    let Game: GameObject = new GameObject(plate)

    print.info(`Great, the license plate is ${Game.plate}.`)
    print.info(`The numbers you have to work with are ${Game.numbers}.`)

    Game.loop()

    print.info('You win!')
  }
}

module.exports = command
