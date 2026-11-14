document.addEventListener("DOMContentLoaded", async function () {
	const painelLogin = document.getElementById("login");
	const cadastro = document.getElementById("pagCadastro");
	const pnlCadatsro = document.getElementById("pnlCadatsro");
	const btnMenu = document.getElementById("menu");
	const menuLateral = document.getElementById("mnLat");
	const campoNomeDaCasa = document.getElementById("nomeCasa");
	const botaoAdicionarCasa = document.getElementById("addCasa");
	const statusDaCasa = document.getElementById("casaStatus");
	const listaCasas = document.getElementById("casasDisponiveis");
	const listaCasasPi = document.getElementById("casasDisponiveisPi");
	const seletorCasaConvite = document.getElementById("casaConvite");
	const botaoGerarConvite = document.getElementById("gerarConvite");
	const statusConvite = document.getElementById("conviteStatus");
	const campoCodigoConvite = document.getElementById("codigoConvite");
	const botaoAceitarConvite = document.getElementById("aceitarConvite");
	const statusAceitarConvite = document.getElementById("conviteAceiteStatus");
	const elogin = document.getElementById("elogin");
	const filtrar = document.getElementById("filtrar");
	const yy = document.getElementById("yy");
	const xx = document.getElementById("xx");



	async function carregarSelectCasa() {
		const select = document.getElementById("selCasa");
		select.innerHTML = '<option value="">Selecione uma casa</option>';

		const { data: registros, error } = await banco
			.from("Casas")
			.select("id, casa")

		if (error) {
			console.error("Erro ao carregar registros:", error);
			painel.textContent = `Erro ao carregar: ${error.message}`;
			return;
		}

		for (const registro of registros) {
			const option = document.createElement("option");
			option.value = registro.id;
			option.textContent =
				`${registro.casa}`;
			select.appendChild(option);
			console.log(registro)
		}

	}
	carregarSelectCasa();
	const selectCasa = document.getElementById("selCasa");
	const selectDia = document.getElementById("dia");
	filtrar.addEventListener("click", function () {
		console.log(selectDia.value)
		mostrarRegistros(selectCasa.value, selectDia.value);
	});

	async function carregarCasasDisponiveis() {

		const { data: casas, error } = await banco
			.from("Casas")
			.select("id, casa")
			.order("id", { ascending: true });
		if (error) {
			console.error("Erro ao carregar casas:", error);
			statusDaCasa.textContent = "Não foi possível carregar as casas.";
			return;
		}

		seletorCasaConvite.replaceChildren();

		const opcaoPadrao = document.createElement("option");
		opcaoPadrao.value = "";
		opcaoPadrao.textContent = "Selecione uma casa";
		seletorCasaConvite.appendChild(opcaoPadrao);

		for (const casa of casas) {
			const opcao = document.createElement("option");
			opcao.value = casa.id;
			opcao.textContent = casa.casa;
			seletorCasaConvite.appendChild(opcao);
		}

		if (casas.length === 0) {
			statusDaCasa.textContent = "Nenhuma casa disponível para esta conta.";
			listaCasas.textContent = "";
			listaCasasPi.textContent = "";
			return;
		}

		statusDaCasa.textContent = "";
		listaCasas.innerHTML = `Casas disponíveis para ${user.textContent}(Propirtário): <br> ` + casas.map(casa => casa.casa).join(",<br>");
		listaCasasPi.innerHTML = `Casas disponíveis para ${user.textContent}(Piscineiro): <br> ` + casas.map(casa => casa.casa).join(",<br>");

	}
		document.getElementById("yy").addEventListener("click", function () {
			document.getElementById('pnlCasa').classList.remove('show')
			document.getElementById('pnlCodigoPisc').classList.remove('show')
			document.getElementById('pnlCodigoProp').classList.remove('show')
			menuLateral.classList.remove('mostrar')
			document.getElementById('pnlCodigoPisc').classList.remove('show')
		});
	document.getElementById('xxPi').addEventListener('click', function () {
		document.getElementById('pnlCodigoPisc').classList.add('show')
		document.getElementById('pnlCasa').classList.remove('show')
		document.getElementById('pnlCodigoProp').classList.remove('show')
		menuLateral.classList.remove('mostrar')
	})
	xx.addEventListener('click', function () {
		document.getElementById('pnlCodigoProp').classList.add('show')
		document.getElementById('pnlCasa').classList.remove('show')
		menuLateral.classList.remove('mostrar')
		document.getElementById('pnlCodigoPisc').classList.remove('show')
	})
	const pgPrinc = document.getElementById("pgPrinc");
	btnMenu.addEventListener('click', async function () {
		menuLateral.classList.toggle('mostrar')
		const proprietario = document.getElementById("prop")
		const { data: dados, error } = await banco
			.from("Perfis")
			.select("tipodeperfil")

		if (error) {
			console.error("Erro ao carregar perfil:", error);
			return;
		}

		if (dados) {

				proprietario.classList.add('show')
			}

	})

	botaoAdicionarCasa.addEventListener("click", async function () {
		const nome = campoNomeDaCasa.value.trim();

		if (nome === "") {
			statusDaCasa.textContent = "Digite o nome da casa.";
			return;
		}

		const { data, error: erroUsuario } = await banco.auth.getUser();
		if (erroUsuario || !data.user) {
			statusDaCasa.textContent = "Você precisa estar logado para adicionar uma casa.";
			console.error("Erro ao identificar a conta:", erroUsuario);
			return;
		}
		const { error: erroInsercao } = await banco
			.from("Casas")
			.insert({
				casa: nome,
				proprietario: data.user.id,
				piscineiro: null
			});

		if (erroInsercao) {
			statusDaCasa.textContent = "Não foi possível adicionar a casa.";
			console.error("Erro ao adicionar casa:", erroInsercao);
			return;
		}

		statusDaCasa.textContent = `Casa "${nome}" adicionada.`;
		campoNomeDaCasa.value = "";

		await carregarCasasDisponiveis();

	});

	botaoGerarConvite.addEventListener("click", async function () {
		const idCasa = seletorCasaConvite.value;

		if (!idCasa) {
			statusConvite.textContent = "Selecione uma casa.";
			return;
		}

		statusConvite.textContent = "Gerando convite...";

		const { data: codigo, error } = await banco.rpc("criar_convite", {
			p_id_casa: idCasa
		});

		if (error) {
			console.error("Erro ao criar convite:", error);
			statusConvite.textContent = "Não foi possível criar o convite: " + error.message;
			return;
		}

		statusConvite.textContent =
			`Convite: ${codigo} — válido por 24 horas. Compartilhe esse código com o piscineiro.`;
	});

	botaoAceitarConvite.addEventListener("click", async function () {
		const codigo = campoCodigoConvite.value.trim();

		if (!codigo) {
			statusAceitarConvite.textContent = "Digite o código do convite.";
			return;
		}

		statusAceitarConvite.textContent = "Verificando convite...";

		const { data: mensagem, error } = await banco.rpc("aceitar_convite", {
			p_codigo: codigo
		});

		if (error) {
			console.error("Erro ao aceitar convite:", error);
			statusAceitarConvite.textContent =
				"Não foi possível aceitar o convite: " + error.message;
			return;
		}

		statusAceitarConvite.textContent = mensagem;
		campoCodigoConvite.value = "";

		await carregarCasasDisponiveis();
	});

	async function garantirPerfil(conta, tipoSelecionado = null) {
		const nomePerfil =
			conta.user_metadata?.nome ||
			conta.email?.split("@")[0] ||
			"";


		if (!conta.user_metadata?.tipodeperfil) {
			const { error } = await banco.auth.updateUser({
				data: {
					nome: nomePerfil,
				}
			});

		}

		const { data: perfil, error: erroBusca } = await banco
			.from("Perfis")
			.select("auth_id")
			.eq("auth_id", conta.id)
			.maybeSingle();

		if (erroBusca) {
			return "Não foi possível verificar o perfil: " + erroBusca.message;
		}

		if (!perfil) {
			const { error: erroInsercao } = await banco
				.from("Perfis")
				.insert({
					auth_id: conta.id,
					nome: nomePerfil,
				});

			if (erroInsercao) {
				return "Não foi possível salvar o perfil: " + erroInsercao.message;
			}
		}

		return null;
	}
		document.getElementById("sair").addEventListener("click", async function () {
			const { error } = await banco.auth.signOut();

			if (error) {
				console.error("Erro ao deslogar:", error);
				return;
			}

			localStorage.removeItem("loginEfetuado");
			location.reload();
		});

	let loginRealizado = "";
	let user = document.getElementById("user");
	let account = document.getElementById("account");
	account.textContent = "Visitante"
	let initials = document.getElementById("initials");
	initials.textContent = "VI"
	user.textContent = "";

	const { data: { session }, error } = await banco.auth.getSession();

	if (error) {
		console.error("Erro ao verificar a sessão:", error);
	}

	if (session) {
		const nome =
			session.user.user_metadata?.nome ||
			session.user.email.split("@")[0];

		initials.textContent = nome[0]+nome[1].toUpperCase()
		user.textContent = nome;
		account.textContent = nome;
		localStorage.setItem("loginEfetuado", nome);

		const erroPerfil = await garantirPerfil(
			session.user,
		);

		if (erroPerfil) {
			console.error(erroPerfil);
		}
		await carregarCasasDisponiveis();
	} else {
		painelLogin.classList.add("show");
	}
	cadastro.addEventListener('click', function () {
		pnlCadatsro.classList.add('show')
		painelLogin.classList.remove("show");
	});

	elogin.addEventListener('click', function () {
		painelLogin.classList.add("show");
		pnlCadatsro.classList.remove("show");
	})


	const entrar = document.getElementById("entrar");
	const criarConta = document.getElementById("criarConta");

	entrar.addEventListener("click", async function () {
		const email = document.getElementById("inputCad").value.trim();
		const senha = document.getElementById("senhaCad").value;
		const painel = document.getElementById("loginSit");
		const { data, error } = await banco.auth.signInWithPassword({
			email,
			password: senha
		});

		if (error) {
			document.getElementById("inputCad").style.border = "3px solid red"
			document.getElementById("inputCad").style.color = "red"
			document.getElementById("senhaCad").style.border = "3px solid red"
			document.getElementById("senhaCad").style.color = "red"
			painel.textContent = "E-mail ou senha incorretos.";
			console.error(error);
			return;
		}

		const nome =
			data.user.user_metadata?.nome ||
			document.getElementById("nomeInput").value.trim() ||
			data.user.email.split("@")[0];

		const tipoRadio = document.querySelector('input[name="check"]:checked');
		const erroPerfil = await garantirPerfil(
			data.user,
			tipoRadio?.value
		);

		if (erroPerfil) {
			painel.textContent = erroPerfil;
			console.error(erroPerfil);
			return;
		}

		localStorage.setItem("loginEfetuado", nome);
		user.textContent = nome;
		document.getElementById("inputCad").style.border = "3px solid green"
		document.getElementById("senhaCad").style.border = "3px solid green"
		document.getElementById("inputCad").style.color = "green"
		document.getElementById("senhaCad").style.color = "green"
		painelLogin.classList.remove("show");
	});

	criarConta.addEventListener("click", async function () {
		const nome = document.getElementById("nomeInput").value.trim();
		const email = document.getElementById("input").value.trim();
		const senha = document.getElementById("senha").value;
		const painelCadastro = document.getElementById("cadastroSit");

		if (!nome || !email || !senha) {
			painelCadastro.textContent =
				"Preencha nome, e-mail e senha para criar a conta.";
				document.getElementById("nomeInput").style.border = "3px solid red"
				document.getElementById("input").style.border = "3px solid red"
				document.getElementById("senha").style.border = "3px solid red"
			return;
		}


		const { data, error } = await banco.auth.signUp({
			email,
			password: senha,
			options: {
				emailRedirectTo:
					"https://guilhermecollisoares10-web.github.io/Controle-de-piscina/",
				data: {
					nome: nome,
				}
			}
		});

		if (error) {
			painelCadastro.textContent =
				"Não foi possível criar a conta: " + error.message;
			console.error(error);
			return;
		}

		if (data.session) {
			const erroPerfil = await garantirPerfil(data.user, tipo);

			if (erroPerfil) {
				painelCadastro.textContent =
					"Conta criada, mas não foi possível salvar o perfil: " + erroPerfil;
				console.error(erroPerfil);
				return;
			}

			localStorage.setItem("loginEfetuado", nome);
			user.textContent = nome;
			painelCadastro.textContent = "Conta criada.";
			document.getElementById("nomeInput").style.border = "3px solid green"
			document.getElementById("input").style.border = "3px solid green"
			document.getElementById("senha").style.border = "3px solid green"
			painelLogin.classList.remove("show");
		} else {
			painelCadastro.textContent =
				"Conta criada. Confirme o e-mail e depois entre com sua conta.";
		}
	});

	const button = document.button;
	const body = document.body;
	const btnd = document.getElementById("btndk");
	const btnl = document.getElementById("btnlg");
	const con = document.getElementById("cont");
	//const selPesq  = document.getElementById('selPesq');
	//const btnp  = document.getElementById('pesqui');
	//const genero  = document.getElementById('selectFormal');
	//const pesquisa  = document.getElementById('pesquisa');

	document.getElementById("add").addEventListener('click', function () {
		document.getElementById("pnlCasa").classList.add('show');
		document.getElementById("pnlCodigoProp").classList.remove('show');
		menuLateral.classList.remove('mostrar')
	});

	async function mostrarRegistros(idCasa, dia) {
		const painel = document.getElementById("painel");
		painel.replaceChildren();

		if (!idCasa && !dia) {
			document.getElementById("inicial").hidden = false;
			document.getElementById("vazio").hidden = true;
			return;
		}

		let consulta = banco
			.from("Controle de Piscina")
			.select("*")
			.order("dia", { ascending: false });

		if (idCasa) consulta = consulta.eq("id_casa", idCasa);
		if (dia) consulta = consulta.eq("dia", dia);

		const { data: registros, error } = await consulta;

		if (error) {
			console.error("Erro ao carregar os registros:", error);
			return;
		}

		document.getElementById("inicial").hidden = true;
		document.getElementById("vazio").hidden = registros.length > 0;

		for (const registro of registros) {
			const cartao = document.createElement("div");
			cartao.className = "jg1";

			const dia = document.createElement("div");
			dia.className = "nm1";
			dia.textContent = registro.dia;

			const link = document.createElement("a");
			link.href =
				`Controle_dia.html?dia=${encodeURIComponent(registro.dia)}`;

			const imagem = document.createElement("img");
			imagem.src = registro.codigo ||
				"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSka65kV9IPeZQ8e5s3lATdqYM_XN-84ljKGS4pL6UvIQ&s=10";
			imagem.alt = `Abrir registro do dia ${registro.dia}`;
			imagem.style.width = "13vw";
			imagem.style.height = "11vw";
			imagem.style.borderRadius = "11px";

			link.appendChild(imagem);
			cartao.append(dia, link);
			painel.appendChild(cartao);
		}
	}
	await carregarSelectCasa();
	await mostrarRegistros(selectCasa.value);


});
