const es = {
  sections: {
    home: 'Inicio',
    competition: 'Liga | Ligas',
    team: 'Equipo | Equipos',
    player: 'Jugadore | Jugadores'
  },
  options: {
    genders: {
      text: {
        f: 'Fem',
        m: 'Masc'
      },
      long: {
        f: 'Feminino',
        m: 'Masculino'
      }
    },
    phases: {
      overall: 'Total',
      groups: 'Phase regulares',
      playoffs: 'Playoffs'
    },
    stats: {
      sheet: 'Stats sheet',
      playbyplay: 'Play-by-Play',
      statsavg: 'Promedios',
      statscumul: 'Cumulados',
      groups: {
        fga: 'FG attempts',
        oreb: 'Off/def rebounds',
        tov: 'Turnovers',
        blka: 'Block against',
        f: 'Fouls',
        dnp: 'DNP',
      }
    },
    playerStats: {
      text: {
        gp: 'GP',
        time: 'Min',
        ftm: 'FTM',
        fta: 'FTA',
        ftprc: 'FT%',
        fgm: 'FGM',
        fga: 'FGA',
        fgprc: '2P%',
        fg3m: '3PM',
        fg3a: '3PA',
        fg3prc: '3P%',
        reb: 'Reb',
        dreb: 'DReb',
        oreb: 'OReb',
        ast: 'Ast',
        stl: 'Stl',
        blk: 'Blk',
        blka: 'BlkAg',
        tov: 'TOv',
        fcm: 'FCo',
        fdr: 'FDr',
        pir: 'PIR',
        pts: 'Pts',
        ptsavg: 'Pts avg.',
        dnp: 'DNP'
      },
      long: {
        gp: 'Juegos',
        time: 'Minutos',
        ftm: 'Tiros libres conv.',
        fta: 'Tiros libres int.',
        ftprc: '% tiros libres',
        fgm: '2pts conv.',
        fga: '2pts int.',
        fgprc: '% 2pts',
        fg3m: '3pts conv.',
        fg3a: '3pts int.',
        fg3prc: '% 3pts',
        reb: 'Rebotes tot.',
        dreb: 'Rebotes def.',
        oreb: 'Rebotes off.',
        ast: 'Asistencias',
        stl: 'Robos',
        blk: 'Bloqueos',
        blka: 'Bloqueos en contra',
        tov: 'Pérdidas de balón',
        fcm: 'Faltas personales cometidas',
        fdr: 'Faltas personales señaladas',
        pir: 'Índice de rendimiento',
        pts: 'Puntos',
        ptsavg: 'Puntos prom.',
        dnp: 'Did not play'
      }
    },
    scoreboxRecorder: {
      ftm: '+1Pt',
      fta: 'Tiro Libre',
      fgm: '+2Pts',
      fga: 'Tiro 2Pts',
      fg3m: '+3Pts',
      fg3a: 'Tiro 3Pts',
      reb: 'Reb',
      dreb: 'Reb. defensivo',
      oreb: 'Reb. ofensivo',
      ast: 'Asistencia',
      stl: 'Robo',
      blk: 'Bloqueo',
      tov: 'Bal. perdido',
      fcm: 'Falta',
      fdr: 'Falta sobre',
      subout: 'Sust. sale',
      subin: 'Sust. entra'
    },
    awards: {
      text: {
        mvp: 'MVP',
        def: 'Def'
      },
      long: {
        mvp: 'Mejor jugador',
        def: 'Mejor defensor'
      }
    },
    rankingStats: {
      text: {
        pos: 'Pos'
      },
      long: {
        pos: 'Posición'
      }
    },
    standingStats: {
      text: {
        pos: 'Pos',
        gp: 'GP',
        wins: 'W',
        ptsfv: 'Pts+',
        ptsag: 'Pts-',
        ptsdiff: '+/-',
        hist: 'Últimos'
      },
      long: {
        pos: 'Posición',
        gp: 'Partidos jugados',
        wins: 'Ganados',
        ptsfv: 'Puntos anotados',
        ptsag: 'Puntos encajados',
        ptsdiff: 'Diferencia de pts',
        hist: 'Últimos juegos'
      }
    }
  },
  cta: {
    cancel: 'Cancelar',
    submit: 'Guardar',
    view: 'Ver'
  },
  home: {
    showPasts: 'Monstrar ligas pasadas',
    titleCurrents: 'Ligas actuales:',
    titlePasts: 'Ligas pasadas:',
    lastUpdate: 'Última actualización'
  },
  bracket: {
    winnerFrom: 'Ganador de {n}'
  },
  //
  global: {
    competition: 'Liga | Ligas',
    group: 'Grupo | Grupos',
    standing: 'Clasificación',
    ranking: 'Líderes',
    playoffs: 'Playoffs',
    game: 'Juego | Juegos',
    gameDetails: {
      live: 'Vivo',
      period: {
        text: 'P',
        long: 'Periodo | Periodos'
      },
      finalScore: {
        text: 'Final',
        long: 'Puntaje final'
      },
      ot: {
        text: 'OT',
        lang: 'Tiempo extra'
      },
      opponent: {
        text: 'Adv',
        long: 'Adversario | Adversarios'
      }
    },
    playerDetails: {
      firstName: 'Nombre',
      lastName: 'Appelido',
      age: 'Edad'
    },
    team: 'Equipo | Equipos',
    player: 'Jugador | Jugadores',
    statistic: 'Estadística | Estadísticas',
    total: 'Total | Totals',
    date: 'Fecha | Fechas',
    previous: 'Ultimo | Ultimos',
    upcoming: 'Proximo | Proximos',
    search: 'Buscar',
    backToTop: 'Volver arriba',
    open: 'Open',
    close: 'Close'
  }
}

export default es
