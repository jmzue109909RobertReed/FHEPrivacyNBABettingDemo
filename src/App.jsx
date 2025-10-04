import React, { useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contracts'
import './index.css'
import { IS_DEMO } from './config/app'

export default function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  // Match creation form
  const [homeTeam, setHomeTeam] = useState('Lakers')
  const [awayTeam, setAwayTeam] = useState('Warriors')
  const [gameDate, setGameDate] = useState('2024-01-15')
  const [deadline, setDeadline] = useState('')
  const [overUnderLine, setOverUnderLine] = useState('220')

  // Betting form
  const [selectedMatchId, setSelectedMatchId] = useState('0')
  const [betAmount, setBetAmount] = useState('0.01')
  const [betChoice, setBetChoice] = useState('0') // 0=Home, 1=Away, 2=Over/Under

  // Settlement form
  const [settleMatchId, setSettleMatchId] = useState('0')
  const [settleResult, setSettleResult] = useState('0')

  const [status, setStatus] = useState('')

  const contract = useMemo(() => {
    if (!signer) return null
    try {
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    } catch {
      return null
    }
  }, [signer])

  useEffect(() => {
    if (!window.ethereum) return
    const prov = new BrowserProvider(window.ethereum)
    setProvider(prov)
  }, [])

  useEffect(() => {
    if (contract) {
      loadMatches()
    }
  }, [contract])

  async function connect() {
    if (!provider) return
    try {
      await provider.send('eth_requestAccounts', [])
      const s = await provider.getSigner()
      setSigner(s)
      setAccount(await s.getAddress())
      setStatus('Wallet connected successfully')
    } catch (error) {
      setStatus('Failed to connect wallet')
    }
  }

  async function loadMatches() {
    if (!contract) return
    try {
      setLoading(true)
      const totalMatches = await contract.getTotalMatches()
      const matchesData = []
      
      for (let i = 0; i < totalMatches; i++) {
        try {
          const matchInfo = await contract.getMatchInfo(i)
          matchesData.push({
            id: i,
            homeTeam: matchInfo.homeTeam,
            awayTeam: matchInfo.awayTeam,
            gameDate: matchInfo.gameDate,
            deadline: matchInfo.deadline,
            state: matchInfo.state,
            totalPool: matchInfo.totalPool,
            poolByOutcome0: matchInfo.poolByOutcome0,
            poolByOutcome1: matchInfo.poolByOutcome1,
            poolByOutcome2: matchInfo.poolByOutcome2,
            overUnderLine: matchInfo.overUnderLine
          })
        } catch (error) {
          console.error(`Error loading match ${i}:`, error)
        }
      }
      
      setMatches(matchesData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading matches:', error)
      setLoading(false)
    }
  }

  async function onCreateMatch() {
    if (!contract) return
    try {
      setStatus('Creating match...')
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
      
      const fee = await provider.getFeeData()
      const estGas = await contract.createMatch.estimateGas(
        homeTeam.trim(),
        awayTeam.trim(),
        gameDate.trim(),
        deadlineTimestamp,
        parseInt(overUnderLine)
      ).catch(() => 300000n)
      
      const tx = await contract.createMatch(
        homeTeam.trim(),
        awayTeam.trim(),
        gameDate.trim(),
        deadlineTimestamp,
        parseInt(overUnderLine),
        {
          gasLimit: estGas,
          maxFeePerGas: fee.maxFeePerGas ?? undefined,
          maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? undefined
        }
      )
      
      await tx.wait()
      const newId = (await contract.matchCounter()) - 1n
      setSelectedMatchId(String(newId))
      setSettleMatchId(String(newId))
      setStatus(`Match created successfully! Match ID: ${newId}`)
      loadMatches()
    } catch (e) {
      console.error(e)
      setStatus(`Create failed: ${e?.reason || e?.message || 'unknown error'}`)
    }
  }

  async function onPlaceBet() {
    if (!contract) return
    try {
      setStatus('Placing bet...')
      if (IS_DEMO) {
        const tx = await contract.placeBetMock(
          parseInt(selectedMatchId), 
          parseInt(betChoice), 
          { value: parseEther(betAmount) }
        )
        await tx.wait()
        setStatus('Bet placed successfully!')
        loadMatches()
      } else {
        throw new Error('Production FHE path not implemented in demo')
      }
    } catch (e) {
      console.error(e)
      setStatus(`Bet failed: ${e?.reason || e?.message || 'unknown error'}`)
    }
  }

  async function onCloseMatch() {
    if (!contract) return
    try {
      setStatus('Closing match...')
      const tx = await contract.closeMatch(parseInt(settleMatchId))
      await tx.wait()
      setStatus('Match closed successfully!')
      loadMatches()
    } catch (e) {
      console.error(e)
      setStatus(`Close failed: ${e?.reason || e?.message || 'unknown error'}`)
    }
  }

  async function onSettleMatch() {
    if (!contract) return
    try {
      setStatus('Settling match...')
      const tx = await contract.settleMatch(parseInt(settleMatchId), parseInt(settleResult))
      await tx.wait()
      setStatus('Match settled successfully!')
      loadMatches()
    } catch (e) {
      console.error(e)
      setStatus(`Settle failed: ${e?.reason || e?.message || 'unknown error'}`)
    }
  }

  async function onClaim() {
    if (!contract) return
    try {
      setStatus('Claiming winnings...')
      const tx = await contract.claim(parseInt(settleMatchId))
      await tx.wait()
      setStatus('Winnings claimed successfully!')
    } catch (e) {
      console.error(e)
      setStatus(`Claim failed: ${e?.reason || e?.message || 'unknown error'}`)
    }
  }

  const getMatchState = (state) => {
    switch (state) {
      case 0: return 'Open'
      case 1: return 'Closed'
      case 2: return 'Settled'
      default: return 'Unknown'
    }
  }

  const getBetChoiceText = (choice) => {
    switch (choice) {
      case '0': return 'Home Win'
      case '1': return 'Away Win'
      case '2': return 'Over/Under'
      default: return 'Unknown'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🏀 Privacy NBA Betting</h1>
        <p>Secure, private basketball betting with FHE technology</p>
      </header>

      <div className="wallet-section">
        <button className="connect-btn" onClick={connect}>
          {account ? `Connected: ${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>

      <div className="main-content">
        <div className="section">
          <h2>Create New Match</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Home Team</label>
              <input 
                value={homeTeam} 
                onChange={e => setHomeTeam(e.target.value)}
                placeholder="e.g., Lakers"
              />
            </div>
            <div className="form-group">
              <label>Away Team</label>
              <input 
                value={awayTeam} 
                onChange={e => setAwayTeam(e.target.value)}
                placeholder="e.g., Warriors"
              />
            </div>
            <div className="form-group">
              <label>Game Date</label>
              <input 
                type="date"
                value={gameDate} 
                onChange={e => setGameDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Betting Deadline</label>
              <input 
                type="datetime-local"
                value={deadline} 
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Over/Under Line</label>
              <input 
                type="number"
                value={overUnderLine} 
                onChange={e => setOverUnderLine(e.target.value)}
                placeholder="220"
              />
            </div>
          </div>
          <button className="action-btn" onClick={onCreateMatch}>Create Match</button>
        </div>

        <div className="section">
          <h2>Place Bet</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Match ID</label>
              <input 
                value={selectedMatchId} 
                onChange={e => setSelectedMatchId(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Bet Choice</label>
              <select value={betChoice} onChange={e => setBetChoice(e.target.value)}>
                <option value="0">Home Win</option>
                <option value="1">Away Win</option>
                <option value="2">Over/Under</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount (ETH)</label>
              <input 
                type="number"
                step="0.001"
                value={betAmount} 
                onChange={e => setBetAmount(e.target.value)}
                placeholder="0.01"
              />
            </div>
          </div>
          <button className="action-btn" onClick={onPlaceBet}>Place Bet</button>
        </div>

        <div className="section">
          <h2>Match Management</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Match ID</label>
              <input 
                value={settleMatchId} 
                onChange={e => setSettleMatchId(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Final Result</label>
              <select value={settleResult} onChange={e => setSettleResult(e.target.value)}>
                <option value="0">Home Win</option>
                <option value="1">Away Win</option>
                <option value="2">Over/Under</option>
              </select>
            </div>
          </div>
          <div className="button-group">
            <button className="action-btn" onClick={onCloseMatch}>Close Betting</button>
            <button className="action-btn" onClick={onSettleMatch}>Settle Match</button>
            <button className="action-btn" onClick={onClaim}>Claim Winnings</button>
          </div>
        </div>

        <div className="section">
          <h2>Active Matches</h2>
          {loading ? (
            <p>Loading matches...</p>
          ) : matches.length === 0 ? (
            <p>No matches found. Create a match to get started!</p>
          ) : (
            <div className="matches-grid">
              {matches.map((match) => (
                <div key={match.id} className="match-card">
                  <div className="match-header">
                    <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                    <span className={`status ${getMatchState(match.state).toLowerCase()}`}>
                      {getMatchState(match.state)}
                    </span>
                  </div>
                  <div className="match-details">
                    <p><strong>Date:</strong> {match.gameDate}</p>
                    <p><strong>Over/Under Line:</strong> {match.overUnderLine}</p>
                    <p><strong>Total Pool:</strong> {formatEther(match.totalPool)} ETH</p>
                    <div className="pools">
                      <div className="pool-item">
                        <span>Home Win: {formatEther(match.poolByOutcome0)} ETH</span>
                      </div>
                      <div className="pool-item">
                        <span>Away Win: {formatEther(match.poolByOutcome1)} ETH</span>
                      </div>
                      <div className="pool-item">
                        <span>Over/Under: {formatEther(match.poolByOutcome2)} ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {status && (
        <div className="status-message">
          <p>{status}</p>
        </div>
      )}
    </div>
  )
}
