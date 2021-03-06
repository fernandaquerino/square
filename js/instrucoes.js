       //variáveis do jogo
        var canvas, ctx, VELOCIDADE = 6, maxPulos = 3, estadoAtual, record, img,
      
        pontosParaNovaFase = [5, 10, 15, 20],
        faseAtual = 0,

        labelNovaFase = {
            texto: "",
            opacidade: 0.0,

            fadeIn: function(dt) {
                var fadeInId = setInterval(function() {
                    if (labelNovaFase.opacidade < 1.0)
                        labelNovaFase.opacidade += 0.01;

                    else {
                        clearInterval(fadeInId);
                    }
                }, 10 * dt);
            },

            fadeOut: function(dt) {
                var fadeOutId = setInterval(function() {
                    if (labelNovaFase.opacidade > 0.0)
                        labelNovaFase.opacidade -= 0.01;

                    else {
                        clearInterval(fadeOutId);
                    }
                }, 10 * dt);
            }
        },

        estados = {
            jogar: 0,
            jogando: 1,
            perdeu: 2
        },

        chao = {
            y: ALTURA - 50,
            x: 0,
            altura: 50,

            atualiza: function() {
                this.x -= VELOCIDADE;

                if (this.x <= -30)
                    this.x += 30;
            },

            desenha: function() {
                spriteChao.desenha(this.x, this.y);
                spriteChao.desenha(this.x + spriteChao.largura, this.y);
            }
        },

        bloco = {
            x: 50,
            y: 0,
            altura: 50,
            largura: 50,
            cor: "#ff9239",
            gravidade: 1.6,
            velocidade: 0,
            forcaDoPulo: 23.6,
            qntPulos: 0,
            score: 0,
            rotacao: 0,

            vidas: 3,
            colidindo: false,

            atualiza: function() {
                this.velocidade += this.gravidade;
                this.y += this.velocidade;
                this.rotacao += Math.PI / 180 * VELOCIDADE;

                if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu) {
                    this.y = chao.y - this.altura;
                    this.qntPulos = 0;
                    this.velocidade = 0;
                }
            },

            pula: function() {
                if (this.qntPulos < maxPulos) {
                    this.velocidade = -this.forcaDoPulo;
                    this.qntPulos++;
                }
            },

            reset: function() {
                this.velocidade = 0;
                this.y = 0;
                if (this.score > record) {
                    record = this.score;
                    localStorage.setItem("record", this.score);
                }

                this.vidas = 3;
                this.score = 0;

                VELOCIDADE = 6;
                faseAtual = 0;
                this.gravidade = 1.6;

            },

            desenha: function ()
                {
                    ctx.fillStyle = this.cor;
                    ctx.fillRect(this.x, this.y, this.largura, this.altura);
                }
        },

        obstaculos = {
            _obs: [],
            _scored: false,
            _sprites: [redObstacle, pinkObstacle, blueObstacle, greenObstacle,yellowObstacle],

            timerInsere: 0,

            insere: function() {
                this._obs.push({
                    x: LARGURA,
                    y: chao.y - Math.floor(20 + Math.random() * 100),                    
                    largura: 50,
                    sprite: this._sprites[Math.floor(this._sprites.length * Math.random())]
                });

                this.timerInsere = 30 + Math.floor(20 * Math.random());
            },

            atualiza: function() {
                if (this.timerInsere == 0)
                    this.insere();

                else
                    this.timerInsere--;

                for (var i = 0, tam = this._obs.length; i < tam; i++) {
                    var obj = this._obs[i];
                    obj.x -= VELOCIDADE;

                    if (!bloco.colidindo && obj.x <= bloco.x + bloco.largura && bloco.x <= obj.x + obj.largura && obj.y <= bloco.y + bloco.altura) {

                        bloco.colidindo = true;
                        bloco.cor = '#FFFFFF';

                        setTimeout(function() {
                            bloco.colidindo = false;
                            bloco.cor = '#ff9239';
                        }, 500);

                        if (bloco.vidas >= 1){
                            bloco.vidas--;
                        }else {
                            estadoAtual = estados.perdeu
                        }
                    }

                    else if (obj.x <= 0 && !obj._scored) {
                        bloco.score++;
                        obj._scored = true;

                        if (faseAtual < pontosParaNovaFase.length &&
                             bloco.score == pontosParaNovaFase[faseAtual])
                            passarDeFase();
                    }

                    else if (obj.x <= -obj.largura) {
                        this._obs.splice(i, 1);
                        tam--;
                        i--;
                    }
                }
            },

            limpa: function() {
                this._obs = [];
            },

            desenha: function() {
                for (var i = 0, tam = this._obs.length; i < tam; i++) {
                    var obj = this._obs[i];

                    obj.sprite.desenha(obj.x, obj.y);
                }
            }
        };

        function clique(event) {
            if (estadoAtual == estados.jogar) {
                estadoAtual = estados.jogando;
                frames = 0;
            }

            else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA) {
                estadoAtual = estados.jogar;
                obstaculos.limpa();
                bloco.reset();
            }

            else if (estadoAtual == estados.jogando)
                bloco.pula();
        }

        function passarDeFase() {
            VELOCIDADE++;
            faseAtual++;
            bloco.vidas++;

            labelNovaFase.texto = "Level " + faseAtual;
            labelNovaFase.fadeIn(0.4);

            setTimeout(function() {
                labelNovaFase.fadeOut(0.4);
            }, 800);
        }

        function main() {
            
            chao.y = ALTURA - chao.altura;
            
            canvas = document.createElement("canvas");
            canvas.width = LARGURA;
            canvas.height = ALTURA;
            canvas.style.border = "1px solid #000";

            ctx = canvas.getContext("2d");
            document.body.appendChild(canvas);

            document.addEventListener("mousedown", clique);

            estadoAtual = estados.jogar;

            record = localStorage.getItem("record");

            if (record == null)
                record = 0;

            img = new Image();
            img.src = "imagens/sheet.png";

            roda();
        }        

        function roda() {
            atualiza();
            desenha();

            window.requestAnimationFrame(roda);
        }

        function atualiza() {
            if (estadoAtual == estados.jogando)
                obstaculos.atualiza();

            chao.atualiza();
            bloco.atualiza();
        }

        function desenha() {
            bg.desenha(0, 0);

            ctx.fillStyle = "#fff";
            ctx.font = "50px Arial";
            ctx.fillText(bloco.score, 30, 68);
            ctx.fillText(bloco.vidas, LARGURA - 40, 68);

            ctx.fillStyle = "rgba(0, 0, 0, " + labelNovaFase.opacidade + ")";
            ctx.fillText(labelNovaFase.texto, bloco.x + 70 , ALTURA / 3);

            if (estadoAtual == estados.jogando)
                obstaculos.desenha();

            chao.desenha();
            bloco.desenha();

            if (estadoAtual == estados.jogar){
                jogar.desenha(LARGURA / 2 - jogar.largura / 2, ALTURA / 2 - jogar.altura / 2);
            }

            if (estadoAtual == estados.perdeu) {
                perdeu.desenha(LARGURA / 2 - perdeu.largura / 2, ALTURA / 2 - perdeu.altura / 2 - spriteRecord.altura / 2);

                spriteRecord.desenha(LARGURA / 2 - spriteRecord.largura / 2, ALTURA / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 25);

                ctx.fillStyle = "#fff";

                if (bloco.score > record) {
                    novo.desenha(LARGURA / 2 - 180, ALTURA / 2 + 30);
                    ctx.fillText(bloco.score, spriteRecord.largura - 50, chao.y - 10);
                }

                else{
                    ctx.fillText(bloco.score, spriteRecord.largura - 70, chao.y - 75);
                    ctx.fillText(record, spriteRecord.largura - 70, chao.y - 10);
                }
            }
        }

        //inicializa o jogo
        main();
