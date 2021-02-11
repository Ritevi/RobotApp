# Robot-App

## HTTP API


#### AUTH :
#### auth/register POST
        
* Регистрация пользователя
      
* Параметры запроса:      
        
    Название параметра | Описание | Место хранения
    ------------ | ------------- | -------------
    username | Имя пользователя | тело запроса
    password | Пароль | тело запроса
    email | электронная почта | тело запроса
        
#### auth/login POST
     
* Авторизация пользователя

* Параметры запроса:
     
     Название параметра | Описание | Место хранения
     ------------ | ------------- | -------------
     username | Имя пользователя | тело запроса
     password | Пароль | тело запроса
     fingerprint | Уникальная строка соответствующая этому устройству | тело запроса
     User-Agent | Клиентское приложение с которого был выполнен вход | заголовок запроса
             
* Ответ: 
     
    ``` 
    {
        tokens:{
            refreshToken,
            accessToken
            }
    }     
    ```
#### auth/refresh POST
    
* Обновление токенов, после истечения срока службы
   
    Название параметра | Описание | Место хранения
    ------------ | ------------- | -------------
    refreshToken | Имя пользователя | тело запроса
    accessToken | jsonWebToken   | заголовок запроса ( authorization ) 
    fingerprint | Уникальная строка соответствующая этому устройству | тело запроса
    User-Agent | Клиентское приложение с которого был выполнен вход | заголовок запроса
        
    Пример заголовка authorization: 
    ```
    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoicml0ZXZpIiwiZW1haWwiOiJyaXRldmlAZ21haWwuY29tIiwiaWF0IjoxNjA0MzU1NTA2LCJleHAiOjE2MDQzNTczMDZ9.5BkgyXFz70I5w1pGaRgd7B3ZcUS5HQVzxdH3IsBj0lw     
    ```  
        
* Ответ:
    ``` 
    {
        tokens:{
            refreshToken,
            accessToken
        }
    }     
    ```
     

### ROBOT
#### robot/ POST
        
* Добавить робота к пользователю
        
     Название параметра | Описание | Место хранения
     ------------ | ------------- | -------------
     accessToken | jsonWebToken   | заголовок запроса ( authorization ) 
     robotId | Уникальная строка соответствующая этому устройству | тело запроса      
                

### DEBUG
#### debug/getConnectRobots GET
        
* Получить информацию о подлюченных роботах
        
* Ответ:
    ``` 
    {
        message:"online robots",
        robots:[
        "232",
        "233"
        ]
    }   


#### debug/getConnectUsers GET
        
* Получить информацию о подлюченных пользователях

* Ответ:
    ``` 
    {
        message:"online users",
        users:[
        "1",
        "2"
        ]
    }    
    ```

#### debug/getConnect GET
        
* Получить информацию о подлючениях пользователей к роботам

* Ответ:
    ``` 
    {
        message:"online connects",
        userToRobot:[
        "1":"232",
        "2":"233"
        ]
    }    
    ```




## WEBSOCKET API

#### event: 'message'
    
Принимает сообщения в формате JSON
    
Пример:
    ```
        {
            type: authUser,
            body: accessToken
        }
    ```

Первое сообщение должно быть одним из двух типов:
    
* type: 'authUser'        
        
     Авторизирует пользователя
     
     В body содержит accessToken юзера
     ```
     {
        type: authUser,
        body: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoicml0ZXZpIiwiZW1haWwiOiJyaXRldmlAZ21haWwuY29tIiwiaWF0IjoxNjA0MzU1NTA2LCJleHAiOjE2MDQzNTczMDZ9.5BkgyXFz70I5w1pGaRgd7B3ZcUS5HQVzxdH3IsBj0lw
     }
     ```
* type: 'authRobot'
     
     Аутентифицирует машинку
     
     В body содержит uuid машинки
    
     ```
     {
         type: authRobot,
         body: uuid
     }
     ```
  
Последующие сообщения могут быть следующими типами:

* type: 'changeRobot'
    
    Позволяет пользователю сменить машинку, на которую будут отправляться команды
   
   В body содержит uuid машинки
     ```
     {
         type: changeRobot,
         body: uuid
     }
     ```    
    
* type: 'cmd'
    
    Отправляет сообщение на машинку
    
    В body содержит байты команд.
    
     ```
     {
         type: cmd,
         body: AA
     }
     ```     
    
* type: 'info'
    
    Отправляет сообщение пользователю
    
    В body содержит байты команд.
    
     ```
     {
         type: info,
         body: AA
     }
     ```     
    
    
Отправляемые события:

#### emit: 'message'
    
Вызывает событие, содержащее сообщение в виде JSON

Пример:
    ```
        {
            type: cmd,
            body: AA
        }
    ```

JSON содержит следующие типы:

* type: 'cmd'
    
    Получение команды от пользователя
    

* type: 'info'
    
    Получение информации от робота
    
