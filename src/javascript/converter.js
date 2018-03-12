import ru from 'convert-layout/ru'
import copy from 'copy-text-to-clipboard'


/**
 * Converter
 */
const converter = document.querySelector('.converter')
const converterInputRU = converter.querySelector('#russian')
const converterInputEN = converter.querySelector('#english')
const copyBtnRU = converter.querySelector('#copy-russian')
const copyBtnEN = converter.querySelector('#copy-english')

/*
  Inputs
 */
converterInputRU.addEventListener('focus', () => { converterInputRU.select() })
converterInputEN.addEventListener('focus', () => { converterInputEN.select() })

converterInputRU.addEventListener('keyup', () => {
  converterInputEN.value = ru.toEn(converterInputRU.value)
})

converterInputEN.addEventListener('keyup', () => {
  converterInputRU.value = ru.fromEn(converterInputEN.value)
})

/*
  Copy buttons
 */
copyBtnRU.addEventListener('click', () => copy(converterInputRU.value))
copyBtnEN.addEventListener('click', () => copy(converterInputEN.value))
