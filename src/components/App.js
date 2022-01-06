import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Meme from '../abis/Meme.json'

const ipfsClient = require('ipfs-http-client')
// const ipfsClient = require('ipfs-http-client')   const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port:5001,protocol: 'https'})

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData){
     const abi = Meme.abi
     const address = networkData.address
     const contract = web3.eth.Contract(abi, address)
     this.setState({ contract })
    const memeHash = await contract.methods.get().call()
    this.setState({ memeHash })
    }
    else{
      window.alert('Smart contracts not deployed to network')
    }
  }

constructor(props) {
    super(props);
    this.state = {
      account: '',
      buffer:null,
      contract:null,
      memeHash: 'QmS3g5qWdFzENBmzHViSyDPVWLXQDMwkJMp3NA9EYjJKsw'
    };
  }


  async loadWeb3(){
    if(window.ethereum){
     window.web3 = new Web3(window.ethereum)
    }
    if (window.web3){
     window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
    window.alert('Please use metamask')
    }
  }


captureFile = (event) =>
{
  event.preventDefault()
  const file = event.target.files[0]
  const reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => {
    this.setState({buffer: Buffer(reader.result) })
  }
}
// "https://ipfs.infura.io/ipfs/QmU5wSCMV6WsYxT41jdVjmKoK1mRmm9ZphBmu54i5NkVQJ"
onSubmit = (event) => {
  event.preventDefault()
  console.log("submitting form..")
  ipfs.add(this.state.buffer, (error, result) => {
  console.log('Ipfs result',result)
  const memeHash = result[0].hash
  this.setState({ memeHash })
  if(error){
  console.error(error)
  return
}
this.state.contract.methods.set(memeHash).send({ from: this.state.account}).then((r) =>{
  this.setState({memeHash})
})
})
}
render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            
            target="_blank"
            rel="noopener noreferrer">
            YATHAM'S MEME GENERATOR
          </a>
          <ul className ="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <small className="text-white">{this.state.account}</small>
          </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div class="skills-row">
                <a>
                <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} />                
                </a>
<p>&nbsp;</p>
<h2>Change meme::</h2>

<form onSubmit={this.onSubmit}>
<input type='file' onChange={this.captureFile}/>
<input  type='submit' />
                </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
