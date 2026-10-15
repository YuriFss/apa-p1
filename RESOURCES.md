# Recursos — APA (UFPB, Prof. Teobaldo Bulhões) — Prova 1

## Fonte principal (define o que cai na prova)

Slides do professor em `./materiais`. Ler visualmente (Read com `pages`): o texto extraído quebra as fórmulas.

| Arquivo | Assunto | Páginas |
|---|---|---|
| `APA_-_0.Curso.pdf` | Ementa, livros-texto, avaliação (2 provas, média = (N1+N2)/2) | 14 |
| `Aula_1_-_Ana769lise_assinto769tica_Parte_1.pdf` | Análise experimental × teórica, tamanho da entrada, operações básicas, contagem de passos (# op / # exec), melhor/pior/caso médio | 30 |
| `Aula_2_-_Ana769lise_assinto769tica_Parte_2.pdf` | Análise assintótica — Parte 2 | 43 |
| `Aula_3_-_Ana769lise_assinto769tica_Parte_3.pdf` | Análise assintótica — Parte 3 | 35 |
| `Aula_4_-_Ana769lise_assinto769tica_Parte_4.pdf` | Análise assintótica — Parte 4 | 37 |
| `Aula_5_-_Recorre770ncias.pdf` | Recorrências | 24 |
| `Aula_6_-_Divisa771o_e_Conquista_Parte_I.pdf` | Divisão e conquista — Parte I | 13 |
| `Aula_7_-_Divisa771o_e_Conquista_Parte_II.pdf` | Divisão e conquista — Parte II | 20 |
| `Aula_8_-_Ordenac807a771o_em_tempo_linear.pdf` | Ordenação em tempo linear (CountingSort) | 28 |
| `Aula_9_-_HeapSort.pdf` | HeapSort | 43 |
| `Lista_exerci769cios__Unidade_1_.pdf` | Lista 1: 8 questões (eficiência, BubbleSort, O/Ω/Θ, recorrências pelo método iterativo, Kadane, busca de substring) | 4 |
| `Lista_exerci769cios__Unidade_1____Respostas.pdf` | Gabarito da Lista 1 — **usar só para corrigir, nunca mostrar antes da tentativa** | 13 |

### Convenções do professor (Aula 1)

- Operações básicas: expressões de avaliação, atribuições, indexação de array, chamada e retorno de funções. Cada uma custa tempo constante.
- Tabela `# op / # exec` por linha; T(n) = Σ (# op × # exec).
- O cabeçalho do laço é contado com o mesmo número de execuções do corpo (ex.: `for i = 0 to n-1` → n execuções). O Cormen conta n+1 nesse caso. **Na prova, seguir o professor.**
- `for`/`para` costuma valer 2 op (comparação + incremento); `soma = soma + A[i]` = 3 (indexação, soma, atribuição); `if A[i] > x` = 2; `while i < n and A[i] ≠ x` = 4; `return` = 1. Os slides às vezes contam o `for` como 1 op (soma de matrizes): o que pesa é ser consistente e acertar a coluna `# exec`.

## Fontes de apoio

- CORMEN, T. H.; LEISERSON, C. E.; RIVEST, R. L.; STEIN, C. *Algoritmos: Teoria e Prática*. 3ª ed. Campus, 2012.
  - Cap. 2 (InsertionSort, análise, MergeSort), Cap. 3 (notação assintótica), Cap. 4 (recorrências, teorema mestre), Cap. 6 (HeapSort), Cap. 8 (CountingSort).
- DASGUPTA, S.; PAPADIMITRIOU, C.; VAZIRANI, U. *Algoritmos*. AMGH, 2006.
  - Cap. 0 (Fibonacci, notação O), Cap. 2 (divisão e conquista, teorema mestre).

## Material produzido

- `./lessons/` — lições HTML por aula (`aulaN-M-*.html`)
- `./assets/` — componentes reutilizáveis (stylesheet, animador de array, árvore, quiz)
- `./reference/` — folha de referência por aula
