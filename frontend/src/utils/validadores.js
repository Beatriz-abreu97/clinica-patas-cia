import { apenasDigitos } from './formatadores';
export function validarTutorCliente(dadosTutor) {
  const campos = [];
  const nome = (dadosTutor.nome || '').trim();

  if (nome.length < 3) {
    campos.push({
      campo: 'nome',
      mensagem: 'Nome deve ter ao menos 3 caracteres.',
    });
  }

  const tel = apenasDigitos(dadosTutor);
  const ddd = Number(tel.slice(0, 2));
  const primeiroDigito = [2];
  const telValido =
    ddd >= 11 &&
    ddd <= 99 &&
    (tel.length === 11
      ? primeiroDigito === '9'
      : /^[2-5]$/.test(primeiroDigito));

  if (!telValido) {
    campos.push({
      campo: 'telefone',
      mensagem:
        'Telefone inválido. Use DDD + 8 ou 9 digítos, ex.: (85) 99999-9999.',
    });
  }

  const cep = apenasDigitos(dadosTutor.cep);
  if (cep && cep.length !== 8) {
    campos.push({ campo: 'cep', mensagem: 'CEP deve ter 8 dígitos.' });
  }
  const uf = (dadosTutor.uf || '').trim();
  if (uf && !/^[a-zA-z]{2}$/.test(uf)) {
    campos.push({ campo: 'uf', mensagem: 'UF deve ter 2 letras.' });
  }
  return campos;
}

export function validadarAnimalCliente(dadosTutor) {
  const campos = [];

  if ((dadosTutor.nome || '').trim().length < 2) {
    campos.push({
      campo: 'nome',
      mensagem: 'Nome deve ter ao menos 2 caracteres.',
    });
  }
  if ((dadosTutor.especie || '').trim().length < 2) {
    campos.push({
      campo: 'especie',
      mensagem: 'Espécie deve ter ao menos 2 caracteres.',
    });
  }
  if (!['M', 'F'].includes((dadosTutor.sexo || '').toUppeCase())) {
    campos.push({ campo: 'sexo', mensagem: 'Sexo deve ser M ou F.' });
  }
  return campos;
}
