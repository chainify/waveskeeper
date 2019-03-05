# Шифровка/расшифровка сообщений между двумя получателями

	В src/lib/wallet.js добавлены методы encrypt и decrypt. Дальше их использует src/controllers/WalletController.js и они добавляются к api Waves Keeper в src/backround.js

	Алгоритм работы для передачи сообщения от Sender к Reciever: (используются методы из src/lib/cipherUtils.js )

	1. Sender генерирует общий ключ шифровки/дешифровки из своего приватного ключа и публичного ключа Reciever. Используется метод sharedKey из [библиотеки axlsign.js](https://github.com/wavesplatform/curve25519-js/blob/master/axlsign.js). Затем полученный ключ еще хэшируетсы с помощью SHA256 из cryptoJS для большей безопасности
	2. Sender шифрует сообщение с помощью метода encrypt. Используется AES шифрование из cryptoJS
	3. Reciever генерирует общий ключ из своего приватного ключа и публичного ключа Sender.
	4. Reciever дешифрует сообщение с помощью AES из cryptoJS

[Демо на codepen](https://codepen.io/kmadorin/pen/zygzQb?editors=1111)
Сид фразы для публичных ключей из демо:
Alice:
"twelve patient sleep barrel judge bonus roast rain job resource spare owner"
Bob: 
"skull empower word area cruel flag accident speed absorb idle slam tattoo"

1. Авторизуемся в Keeper под Alice кликом по Waves Auth. 
2. Шифруем сообщение в textarea кнопкой encrypt
3. В Keeper меняем активный аккаунт на Боба и авторизуемся кликом по Waves Auth
4. Дешифруем с помощью decrypt

