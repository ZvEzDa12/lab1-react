import { useState, useCallback, FormEvent } from 'react'

type Gender = 'male' | 'female'

type ActivityLevel = 'min' | 'low' | 'mid' | 'high' | 'very-high'

const ACTIVITY_COEFFICIENTS: Record<ActivityLevel, number> = {
  'min': 1.2,
  'low': 1.375,
  'mid': 1.55,
  'high': 1.7,
  'very-high': 1.9,
}

const INITIAL_AGE = 0
const INITIAL_HEIGHT = 0
const INITIAL_WEIGHT = 0
const AGE_MIN = 0
const AGE_MAX = 150
const NUM_MIN = 0

function clampAge(value: number): number {
  return Math.max(AGE_MIN, Math.min(AGE_MAX, value))
}

function clampNonNegative(value: number): number {
  return Math.max(NUM_MIN, value)
}

function parseNum(input: string): number {
  const n = Number(input)
  return Number.isNaN(n) ? 0 : n
}

function calculateBasalCalories(
  gender: Gender,
  age: number,
  height: number,
  weight: number
): number {
  if (gender === 'male') {
    return 66.5 + 13.75 * weight + 5.003 * height - 6.775 * age
  }
  return 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age
}

export default function App() {
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState<string>(String(INITIAL_AGE))
  const [height, setHeight] = useState<string>(String(INITIAL_HEIGHT))
  const [weight, setWeight] = useState<string>(String(INITIAL_WEIGHT))
  const [activity, setActivity] = useState<ActivityLevel>('min')

  const [ageError, setAgeError] = useState<string>('')
  const [heightError, setHeightError] = useState<string>('')
  const [weightError, setWeightError] = useState<string>('')

  const [basalNorm, setBasalNorm] = useState<number>(0)
  const [weightMaintenanceNorm, setWeightMaintenanceNorm] = useState<number>(0)
  const [isResultVisible, setIsResultVisible] = useState(false)

  const validateAge = useCallback((value: string) => {
    if (value === '' || value === undefined) {
      setAgeError('Заполните поле')
      return false
    }
    const n = parseNum(value)
    if (n < AGE_MIN || n > AGE_MAX) {
      setAgeError('Возраст должен быть от 0 до 150')
      return false
    }
    setAgeError('')
    return true
  }, [])

  const validateHeight = useCallback((value: string) => {
    if (value === '' || value === undefined) {
      setHeightError('Заполните поле')
      return false
    }
    const n = parseNum(value)
    if (n < NUM_MIN) {
      setHeightError('Значение не должно быть отрицательным')
      return false
    }
    setHeightError('')
    return true
  }, [])

  const validateWeight = useCallback((value: string) => {
    if (value === '' || value === undefined) {
      setWeightError('Заполните поле')
      return false
    }
    const n = parseNum(value)
    if (n < NUM_MIN) {
      setWeightError('Значение не должно быть отрицательным')
      return false
    }
    setWeightError('')
    return true
  }, [])

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      setAge('')
      setAgeError('Заполните поле')
      return
    }
    const n = parseNum(raw)
    const clamped = clampAge(n)
    setAge(String(clamped))
    validateAge(String(clamped))
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      setHeight('')
      setHeightError('Заполните поле')
      return
    }
    const n = parseNum(raw)
    const clamped = clampNonNegative(n)
    setHeight(String(clamped))
    validateHeight(String(clamped))
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      setWeight('')
      setWeightError('Заполните поле')
      return
    }
    const n = parseNum(raw)
    const clamped = clampNonNegative(n)
    setWeight(String(clamped))
    validateWeight(String(clamped))
  }

  const isFormValid =
    !ageError &&
    !heightError &&
    !weightError &&
    age !== '' &&
    height !== '' &&
    weight !== ''

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    const ageNum = clampAge(parseNum(age))
    const heightNum = clampNonNegative(parseNum(height))
    const weightNum = clampNonNegative(parseNum(weight))
    const basal = calculateBasalCalories(gender, ageNum, heightNum, weightNum)
    const coefficient: number = ACTIVITY_COEFFICIENTS[activity]
    const maintenance = Math.round(basal * coefficient)
    setBasalNorm(Math.round(basal))
    setWeightMaintenanceNorm(maintenance)
    setIsResultVisible(true)
  }

  const handleReset = () => {
    setGender('male')
    setAge(String(INITIAL_AGE))
    setHeight(String(INITIAL_HEIGHT))
    setWeight(String(INITIAL_WEIGHT))
    setActivity('min')
    setAgeError('')
    setHeightError('')
    setWeightError('')
    setIsResultVisible(false)
  }

  return (
    <>
      <div className="bg">
        <div className="bg__overlay" />
        <picture className="bg__img">
          <source srcSet="/assets/images/bg.webp" type="image/webp" />
          <img src="/assets/images/bg.jpeg" alt="Фоновое изображение" />
        </picture>
      </div>
      <div className="counter">
        <h1 className="counter__title h1">Счетчик калорий</h1>
        <div className="counter__body wrapper">
          <form className="form" onSubmit={handleSubmit} onReset={handleReset}>
            <fieldset className="form__group">
              <legend className="form__legend h2">Пол</legend>
              <div className="form__btn-radios">
                <div className="form__btn-radio">
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={() => setGender('male')}
                  />
                  <label htmlFor="male">Мужской</label>
                </div>
                <div className="form__btn-radio">
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={() => setGender('female')}
                  />
                  <label htmlFor="female">Женский</label>
                </div>
              </div>
            </fieldset>

            <fieldset className="form__group form__row">
              <legend className="visually-hidden">Параметры человека</legend>
              <div className="form__group">
                <label className="form__label h2" htmlFor="age">
                  Возраст <span className="text-light">лет</span>
                </label>
                <input
                  className={`form__control ${ageError ? 'form__control_error' : ''}`}
                  type="number"
                  id="age"
                  name="age"
                  value={age}
                  min={AGE_MIN}
                  max={AGE_MAX}
                  onChange={handleAgeChange}
                  onBlur={() => validateAge(age)}
                />
                {ageError && <span className="form__error">{ageError}</span>}
              </div>
              <div className="form__group">
                <label className="form__label h2" htmlFor="height">
                  Рост <span className="text-light">см</span>
                </label>
                <input
                  className={`form__control ${heightError ? 'form__control_error' : ''}`}
                  type="number"
                  id="height"
                  name="height"
                  value={height}
                  min={NUM_MIN}
                  onChange={handleHeightChange}
                  onBlur={() => validateHeight(height)}
                />
                {heightError && (
                  <span className="form__error">{heightError}</span>
                )}
              </div>
              <div className="form__group">
                <label className="form__label h2" htmlFor="weight">
                  Вес <span className="text-light">кг</span>
                </label>
                <input
                  className={`form__control ${weightError ? 'form__control_error' : ''}`}
                  type="number"
                  id="weight"
                  name="weight"
                  value={weight}
                  min={NUM_MIN}
                  onChange={handleWeightChange}
                  onBlur={() => validateWeight(weight)}
                />
                {weightError && (
                  <span className="form__error">{weightError}</span>
                )}
              </div>
            </fieldset>

            <fieldset className="form__group">
              <legend className="form__legend h2">Физическая активность</legend>
              <div className="form__radio">
                <input
                  type="radio"
                  name="activity"
                  id="min"
                  checked={activity === 'min'}
                  onChange={() => setActivity('min')}
                />
                <label className="text" htmlFor="min">
                  Минимальная{' '}
                  <span className="text-light">
                    Сидячая работа, отсутствие физических нагрузок
                  </span>
                </label>
              </div>
              <div className="form__radio">
                <input
                  type="radio"
                  name="activity"
                  id="low"
                  checked={activity === 'low'}
                  onChange={() => setActivity('low')}
                />
                <label className="text" htmlFor="low">
                  Низкая{' '}
                  <span className="text-light">
                    Редкие, нерегулярные тренировки, активность в быту
                  </span>
                </label>
              </div>
              <div className="form__radio">
                <input
                  type="radio"
                  name="activity"
                  id="mid"
                  checked={activity === 'mid'}
                  onChange={() => setActivity('mid')}
                />
                <label className="text" htmlFor="mid">
                  Средняя{' '}
                  <span className="text-light">
                    Тренировки 3-5 раз в неделю
                  </span>
                </label>
              </div>
              <div className="form__radio">
                <input
                  type="radio"
                  name="activity"
                  id="high"
                  checked={activity === 'high'}
                  onChange={() => setActivity('high')}
                />
                <label className="text" htmlFor="high">
                  Высокая{' '}
                  <span className="text-light">
                    Тренировки 6-7 раз в неделю
                  </span>
                </label>
              </div>
              <div className="form__radio">
                <input
                  type="radio"
                  name="activity"
                  id="very-high"
                  checked={activity === 'very-high'}
                  onChange={() => setActivity('very-high')}
                />
                <label className="text" htmlFor="very-high">
                  Очень высокая{' '}
                  <span className="text-light">
                    Больше 6 тренировок в неделю и физическая работа
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="form__btns">
              <button
                className="form__submit btn"
                type="submit"
                disabled={!isFormValid}
              >
                Рассчитать
              </button>
              <button className="form__reset btn btn_transparent" type="reset">
                Очистить поля
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`counter-result wrapper ${isResultVisible ? 'counter-result_active' : ''}`}
      >
        <h2 className="counter-result__title h2">Ваш результат</h2>
        <div className="counter-result__body">
          <p className="counter-result__text text">
            Суточная норма - <strong>{basalNorm} ккал</strong>, необходимая
            организму для нормального функционирования.
          </p>
          <p className="counter-result__text text">
            Для поддержания веса нужно употреблять{' '}
            <strong>{weightMaintenanceNorm} ккал</strong> в день.
          </p>
        </div>
      </div>
    </>
  )
}
