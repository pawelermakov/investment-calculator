let currency_data = null

document.addEventListener('DOMContentLoaded', () => {
  let searchParams = new URLSearchParams(window.location.search.substring(1))

  document.querySelector('#original_amount').value = searchParams.get('original_amount') || ''
  document.querySelector('#amount').value = searchParams.get('amount') || ''
  document.querySelector('#percent').value = searchParams.get('percent') || ''
  document.querySelector('#period').value = searchParams.get('period') || ''
  document.querySelector('#period_type').value = searchParams.get('period_type') || 'm'
  document.querySelector('#currency').value = searchParams.get('currency') || 'RUB'

  fetch('https://www.cbr-xml-daily.ru/daily_json.js').then(response => response.json()).then((data) => {
    currency_data = {
      RUB: {
        value: 1,
        char: '₽'
      },
      USD: {
        value: data.Valute.USD.Value,
        char: '$'
      },
      EUR: {
        value: data.Valute.EUR.Value,
        char: '€'
      }
    }

    document.querySelectorAll('#currency option').forEach((el) => {
      el.innerHTML = `${el.innerHTML} - ${currency_data[el.value].value} ₽`
    })

    if(document.querySelector('#form').checkValidity()) {
      calculate()
    }
  })

  document.querySelector('#form').addEventListener('submit', (e) => {
    calculate()

    e.preventDefault()
  })

  document.querySelector('#copy').addEventListener('click', () => {
    let copyText = document.querySelector('#share')

    copyText.select()
    copyText.setSelectionRange(0, 99999)
    navigator.clipboard.writeText(copyText.value)
  })
})

function calculate() {
  let original_amount = +document.querySelector('#original_amount').value
  let amount = +document.querySelector('#amount').value
  let percent = +document.querySelector('#percent').value
  let period = +document.querySelector('#period').value
  let period_type = document.querySelector('#period_type').value
  let currency = document.querySelector('#currency').value

  if(period_type == 'y') {
    period *= 12
    period_type = 'm'
  }

  let sum = amount
  let pm = percent / 100 / 12
  let total = original_amount

  for(let i = 0; i < period; i++) {
    total += sum
    total *= 1 + pm
  }

  let monthly_profit = total * pm
  let invest = sum * period + original_amount
  let profit = total - invest
  let factor = total / invest
  let percentage_profit = profit / total * 100

  document.querySelector('#result_period').value = period
  document.querySelector('#result_factor').value = formatNumber(Math.round(factor * 100) / 100)
  document.querySelector('#result_total').value = convertNumber(total, currency)
  document.querySelector('#result_monthly_profit').value = convertNumber(monthly_profit, currency)
  document.querySelector('#result_profit').value = convertNumber(profit, currency)
  document.querySelector('#result_percentage_profit').value = formatNumber(Math.round(percentage_profit * 100) / 100)
  document.querySelector('#result_invest').value = convertNumber(invest, currency)

  document.querySelectorAll('.currency').forEach((el) => {
    el.innerHTML = currency_data[currency].char
  })

  document.querySelector('#share').value = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}?original_amount=${original_amount}&amount=${amount}&percent=${percent}&period=${period}&period_type=${period_type}&currency=${currency}`
}

function formatNumber(num) {
  let frac
  let result = ''

  num = '' + num

  if(num.indexOf('.') > 0) {
    frac = num.substring(num.indexOf('.'))
    num = num.substring(0, num.indexOf('.'))

    if(frac.length < 3) {
      frac += '0'
    }
  } else {
    frac = '.00'
  }

  while(num.length > 3) {
    result = ' ' + num.substring(num.length - 3) + result
    num = num.substring(0, num.length - 3)
  }

  return num + result + frac
}

function convertNumber(num, currency) {
  let result = num / currency_data[currency].value

  return formatNumber(Math.round(result * 100) / 100)
}
