/**
 * Converter
 */
import ru from 'convert-layout/ru'
import copy from 'copy-text-to-clipboard'


const converter = document.querySelector('.converter')

/*
  Inputs
 */
const converterInputRU = converter.querySelector('#russian')
const converterInputEN = converter.querySelector('#english')

converterInputRU.addEventListener('blur', () => {
  converterInputRU.value = ru.fromEn(converterInputRU.value)
  converterInputEN.value = ru.toEn(converterInputRU.value)
})

converterInputEN.addEventListener('blur', () => {
  converterInputEN.value = ru.toEn(converterInputEN.value)
  converterInputRU.value = ru.fromEn(converterInputEN.value)
})

converterInputRU.addEventListener('keyup', () => {
  converterInputRU.value = ru.fromEn(converterInputRU.value)
  converterInputEN.value = ru.toEn(converterInputRU.value)
})

converterInputEN.addEventListener('keyup', () => {
  converterInputEN.value = ru.toEn(converterInputEN.value)
  converterInputRU.value = ru.fromEn(converterInputEN.value)
})

/*
  Copy buttons
 */
const copyBtnRU = converter.querySelector('#copy-russian')
const copyBtnEN = converter.querySelector('#copy-english')

copyBtnRU.addEventListener('click', () => {
  copy(converterInputRU.value)
})

copyBtnEN.addEventListener('click', () => {
  copy(converterInputEN.value)
})
