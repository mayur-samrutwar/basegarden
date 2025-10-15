export default function Shop({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* 4 Supporting Poles - Moderately Tall */}
      <mesh position={[-3, 1.25, -1.5]}>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[3, 1.25, -1.5]}>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-3, 1.25, 1.5]}>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[3, 1.25, 1.5]}>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Counter Table - Moderately Higher */}
      <mesh position={[0, 1, -0.5]}>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>
      
      {/* Counter Support */}
      <mesh position={[0, 0.7, -0.5]}>
        <boxGeometry args={[6, 0.2, 0.2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Striped Cap Roof - Moderately Higher */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[6.4, 0.2, 3.4]} />
        <meshLambertMaterial color="#FF6B6B" />
      </mesh>
      
      {/* White Stripes on Roof - Moderately Higher with proper separation */}
      <mesh position={[-2.4, 2.75, 0]}>
        <boxGeometry args={[0.4, 0.2, 3.4]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.8, 2.75, 0]}>
        <boxGeometry args={[0.4, 0.2, 3.4]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.8, 2.75, 0]}>
        <boxGeometry args={[0.4, 0.2, 3.4]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[2.4, 2.75, 0]}>
        <boxGeometry args={[0.4, 0.2, 3.4]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Shop Sign - Moderately Higher */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[3, 0.4, 0.2]} />
        <meshLambertMaterial color="#4ECDC4" />
      </mesh>
      
      {/* Sign Text Area */}
      <mesh position={[0, 3, 0.1]}>
        <boxGeometry args={[2.8, 0.3, 0.1]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Seller Character - Different dress and facing direction */}
      <group position={[0, 0.85, 0.5]} rotation={[0, Math.PI, 0]}>
        {/* Body - Different color dress */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 1, 0.3]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="#FFEAA7" />
        </mesh>
        
        {/* Eyes - Facing forward now */}
        <mesh position={[-0.1, 1.3, 0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        <mesh position={[0.1, 1.3, 0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        
        {/* Left Arm - Properly attached */}
        <mesh position={[-0.3, 0.8, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshLambertMaterial color="#FFEAA7" />
        </mesh>
        
        {/* Right Arm - Properly attached */}
        <mesh position={[0.3, 0.8, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshLambertMaterial color="#FFEAA7" />
        </mesh>
        
        {/* Left Leg - Different color pants */}
        <mesh position={[-0.15, -0.2, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        
        {/* Right Leg - Different color pants */}
        <mesh position={[0.15, -0.2, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* BUY Signboard - Beside shop */}
      <mesh position={[4.5, 1.5, 0]}>
        <boxGeometry args={[0.1, 1.2, 0.8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* BUY Sign */}
      <mesh position={[4.6, 1.5, 0]}>
        <boxGeometry args={[0.05, 1, 0.6]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* BUY Text - Letter B */}
      <mesh position={[4.65, 1.6, -0.2]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.6, -0.1]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.6, 0]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.6, 0.1]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* BUY Text - Letter U */}
      <mesh position={[4.65, 1.6, 0.2]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.6, 0.3]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* BUY Text - Letter Y */}
      <mesh position={[4.65, 1.4, -0.2]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.4, -0.1]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.4, 0]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.4, 0.1]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.4, 0.2]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[4.65, 1.4, 0.3]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
    </group>
  );
}
