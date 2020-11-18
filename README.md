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
                
                
## WEBSOCKET API

#### event: 'message'
    
Принимает сообщения в формате JSON
    
Пример:
    ```
        {
            type: AuthUser,
            body: accessToken
        }
    ```

Первое сообщение должно быть одним из двух типов:
    
* type: 'AuthUser'        
        
     Авторизирует пользователя
     
     В body содержит accessToken юзера
     ```
     {
        type: AuthUser,
        body: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoicml0ZXZpIiwiZW1haWwiOiJyaXRldmlAZ21haWwuY29tIiwiaWF0IjoxNjA0MzU1NTA2LCJleHAiOjE2MDQzNTczMDZ9.5BkgyXFz70I5w1pGaRgd7B3ZcUS5HQVzxdH3IsBj0lw
     }
     ```
* type: 'AuthRobot'
     
     Аутентифицирует машинку
     
     В body содержит uuid машинки
    
     ```
     {
         type: AuthUser,
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
    
    Отправляет команду на клиент
