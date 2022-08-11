var Promise = require("bluebird");

const main = async () => {
  const mrcAddress = "0xef453154766505feb9dbf0a58e6990fd6eb66969";
  const mrcContract = await hre.ethers.getContractAt("MRCRYPTO", mrcAddress);

  //**** CONFIGURACIÓN */
  // Bloque de fin de la cuenta
  const endBlockNumber = 31747672;

  // Total supply de Rackoins (lo he puesto en 10 millones para tests, repartiendo el 10%)
  const supplyRackoins = 10000000;
  const porcentajeRepartir = 10;
  //***** FIN CONFIGURACIÓN */

  const comienzo = Date.now();

  // Bloque de inicio de la cuenta (bloque donde el contrato fue creado, no cambiar)
  const startBlockNumber = 25839542;

  // Bloque en el que se minó el reveal
  const revealBlock = 28079352;

  if (endBlockNumber < startBlockNumber)
    throw "El bloque de fin es menor que el bloque de inicio";

  // Supply a repartir
  const supplyRepartir = (supplyRackoins * porcentajeRepartir) / 100;

  // Leer total supply
  const supply = await mrcContract.totalSupply();
  // const supply = 10000; // Para pruebas
  if (supply < 0) throw "El NFT no tiene supply";

  // Aquí se almacenará el total de bloques holdeados por todos los holders, para calcular después la media
  totalBlocks = 0;

  // Aquí se irá almacenando la cuenta de bloques holdeados por cada holder
  holderBlocks = {};

  console.clear();
  console.log("Leyendo datos de la blockchain...");

  // Leer transfers
  // intervalos es un array que almacena los rangos de intervalos que se van a leer, contiene tuplas de bloque inicio y bloque fin
  const intervalos = [];
  endBlock = endBlockNumber;
  while (endBlock >= startBlockNumber) {
    startBlock = endBlock - 10000;
    if (startBlock < startBlockNumber) {
      startBlock = startBlockNumber;
    }

    intervalos.push([startBlock, endBlock]);

    endBlock -= 10001;
  }

  // Mapeamos el array de intervalos a un array con el resultado de cada tupla de intervalos
  leidos = 0;
  resultados = await Promise.map(
    intervalos,
    (intervalo) => {
      return mrcContract
        .queryFilter(mrcContract.filters.Transfer(), intervalo[0], intervalo[1])
        .then((result) => {
          leidos++;
          process.stdout.write(
            "\rIntervalos de 10k bloques leídos: " +
              leidos +
              " de " +
              intervalos.length +
              " (" +
              ((leidos / intervalos.length) * 100).toFixed(2) +
              "%)"
          );
          return result;
        });
    },
    { concurrency: 50 }
  );

  // Hacemos flat para transformar resultados de ser un array de arrays [[],[],[]] a un array [].
  resultados = resultados.flat();

  console.clear();
  console.log("Procesando datos obtenidos...");

  // Una vez en este punto, en "resultados" tenemos un array con todos los transfers de todos los MRC mezclados
  // Ordenamos el array por blockNumber
  resultados.sort((a, b) => {
    if (a.blockNumber < b.blockNumber) {
      return 1;
    }
    if (a.blockNumber > b.blockNumber) {
      return -1;
    }
    return 0;
  });

  // Loop a todas las transacciones leídas
  procesados = 0;
  for (var i = 1; i <= supply; i++) {
    process.stdout.write(
      "\rMRC procesados: " +
        procesados +
        " de " +
        supply +
        " (" +
        ((procesados / supply) * 100).toFixed(2) +
        "%)"
    );

    transfer = resultados.find(
      (element) => element.args.tokenId.toNumber() === i
    );

    // Leer owner actual
    owner = transfer.args.to;

    // Si el transfer se produjo antes del reveal, se cuenta solo el tiempo desde el reveal
    if (transfer.blockNumber < revealBlock) {
      blockCount = endBlockNumber - revealBlock;
    } else {
      blockCount = endBlockNumber - transfer.blockNumber;
    }

    // Añadir la cuenta de estos bloques al total de bloques holdeados por los holders
    totalBlocks += blockCount;

    // Añadir este conteo de bloques a su owner
    if (holderBlocks[owner] == undefined) {
      holderBlocks[owner] = blockCount;
    } else {
      holderBlocks[owner] = holderBlocks[owner] + blockCount;
    }

    procesados++;
  }

  console.clear();
  console.log("Creando archivo de resultado...");

  // Aquí se irá almacenando el supply que le corresponde a cada cartera
  holderAirdrop = {};

  for (holder in holderBlocks) {
    holderAirdrop[holder] =
      (holderBlocks[holder] / totalBlocks) * supplyRepartir;
  }

  // Almacenar resultado
  var fs = require("fs");
  fs.writeFileSync(
    "airdrop.txt",
    JSON.stringify(holderAirdrop),
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );

  const fin = Date.now();

  console.clear();
  console.log(
    "Archivo creado correctamente en %s segundos",
    (fin - comienzo) / 1000
  );
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
