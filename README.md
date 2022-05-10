# Script para calcular airdrop del banking para holders de Mr Crypto

Este proyecto contiene un script que usa Hardhat para consultar los datos de la red de Polygon y generar con ellos el listado de carteras que recibirían el airdrop, junto con la cantidad de tokens que le correspondería.

El resultado del script es un json con formato "wallet": "cantidad". Al finalizar el script, el resultado se almacena en el txt "airdrop.txt". Ese archivo podrá ser usado posteriormente para la ejecución del airdrop.

El script necesita unos parámetros de configuración para su funcionamiento:

- endBlockNumber: Es el bloque en el que finaliza la cuenta para el banking
- supplyRackoins: Total supply que tendrán los Rackoins
- porcentajeRepartir: Porcentaje de total supply que se airdropeará

El script empezará a contar desde el bloque 28079352, que es el bloque en el que se minó la transacción de reveal.

Para hacer el reparto, el script cuenta el número de bloques que un holder ha holdeado cada MRC. Si yo he holdeado un MRC durante 100 bloques, conseguiré la mitad de Rackoins que mi amigo que ha holdeado durante 200 bloques.

Se hace el sumatorio de todos los bloques holdeados y las Rackoins se reparten en relación a los bloques holdeados de cada holder. Si la comunidad ha conseguido un holdeo de 10k bloques, yo me llevaré el 50% de ese 10% que se airdropeará con un holdeo de 5k bloques.

Es necesario crear un archivo ".env" en la raíz del proyecto para indicar la key de Alchemy, con la línea "ALCHEMY_KEY=<key>".

Update: Ahora la lectura a la blockchain se hace de forma asíncrona. Lo he ejecutado para los 10k MRC y ha tardado 37 min.