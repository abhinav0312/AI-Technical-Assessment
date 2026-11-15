import React, { useState, useRef, useMemo, useCallback } from 'react';
import { SkillGraphNode, SkillGraphEdge } from '@/types/skillgraph';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Star,
  ShieldCheck,
  Zap,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface SkillGraphCanvasProps {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  selectedSkillSlug: string | null;
  onSelectSkill: (slug: string) => void;
  domainFilter: string;
  masteryFilter: string;
  searchQuery: string;
}

const NODE_WIDTH = 210;
const NODE_HEIGHT = 88;

const DOMAIN_HEADERS = [
  { key: 'programming_fundamentals', label: 'Programming', x: 120 },
  { key: 'data_structures', label: 'Data Structures', x: 380 },
  { key: 'algorithms', label: 'Algorithms', x: 640 },
  { key: 'complexity_analysis', label: 'Complexity', x: 900 },
  { key: 'sql_and_databases', label: 'Databases', x: 1160 },
  { key: 'testing', label: 'Testing & Debugging', x: 1420 },
  { key: 'software_engineering_fundamentals', label: 'Software Eng', x: 1680 },
];

export function SkillGraphCanvas({
  nodes,
  edges,
  selectedSkillSlug,
  onSelectSkill,
  domainFilter,
  masteryFilter,
  searchQuery,
}: SkillGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom transform state
  const [transform, setTransform] = useState({ x: 40, y: 30, scale: 0.85 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  // Map of nodes by slug for fast lookups
  const nodeMap = useMemo(() => {
    const map = new Map<string, SkillGraphNode>();
    nodes.forEach((n) => map.set(n.slug, n));
    return map;
  }, [nodes]);

  // Determine active highlight focus (hovered or selected)
  const activeFocusSlug = hoveredSlug || selectedSkillSlug;

  // Compute set of connected nodes and edges for active focus
  const { highlightedEdgeIds, ancestorSlugs, descendantSlugs } = useMemo(() => {
    if (!activeFocusSlug) {
      return {
        highlightedEdgeIds: new Set<string>(),
        ancestorSlugs: new Set<string>(),
        descendantSlugs: new Set<string>(),
      };
    }

    const hEdgeIds = new Set<string>();
    const ancestors = new Set<string>();
    const descendants = new Set<string>();

    // Direct and transitive prerequisites (ancestors)
    const findAncestors = (slug: string) => {
      edges.forEach((edge) => {
        if (edge.target === slug) {
          hEdgeIds.add(edge.id);
          ancestors.add(edge.source);
          findAncestors(edge.source);
        }
      });
    };

    // Direct and transitive dependents (descendants)
    const findDescendants = (slug: string) => {
      edges.forEach((edge) => {
        if (edge.source === slug) {
          hEdgeIds.add(edge.id);
          descendants.add(edge.target);
          findDescendants(edge.target);
        }
      });
    };

    findAncestors(activeFocusSlug);
    findDescendants(activeFocusSlug);

    return {
      highlightedEdgeIds: hEdgeIds,
      ancestorSlugs: ancestors,
      descendantSlugs: descendants,
    };
  }, [activeFocusSlug, edges]);

  // Node matching filter check
  const isNodeMatchingFilter = useCallback(
    (node: SkillGraphNode) => {
      if (domainFilter !== 'all' && node.domain !== domainFilter) {
        return false;
      }
      if (masteryFilter !== 'all' && node.mastery_level !== masteryFilter) {
        return false;
      }
      if (
        searchQuery &&
        !node.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !node.slug.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    },
    [domainFilter, masteryFilter, searchQuery]
  );

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Left-click on canvas background to drag
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(2.2, Math.max(0.4, transform.scale * zoomFactor));

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom centered on cursor
      const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
      const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

      setTransform({ x: newX, y: newY, scale: newScale });
    } else {
      setTransform((prev) => ({ ...prev, scale: newScale }));
    }
  };

  const handleZoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(2.2, prev.scale * 1.2),
    }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.4, prev.scale / 1.2),
    }));
  };

  const handleResetView = () => {
    setTransform({ x: 40, y: 30, scale: 0.85 });
  };

  const handleFitView = () => {
    if (nodes.length === 0) return;
    setTransform({ x: 20, y: 20, scale: 0.65 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#1a1a1a] cursor-grab active:cursor-grabbing border border-[#383838] rounded-2xl shadow-sm"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Floating Canvas Controls Toolbar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-[#262626]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#383838] shadow-md">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#383838] transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#383838] transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#383838] mx-0.5" />
        <button
          onClick={handleResetView}
          title="Reset View"
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#383838] transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handleFitView}
          title="Fit View"
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#383838] transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <span className="text-[11px] font-mono text-[#9ca3af] px-2">
          {Math.round(transform.scale * 100)}%
        </span>
      </div>

      {/* Legend & Accessibility Key */}
      <div className="absolute bottom-4 left-4 z-30 bg-[#262626]/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#383838] shadow-md flex items-center gap-4 text-[11px] text-[#eff2f6]">
        <span className="text-[#9ca3af] font-semibold text-[10px] uppercase tracking-wider">
          Legend:
        </span>
        <div className="flex items-center gap-1.5 text-[#00b8a3] font-medium">
          <Star className="h-3.5 w-3.5 fill-[#00b8a3] text-[#00b8a3]" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1.5 text-sky-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
          <span>Proficient</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#ffa116] font-medium">
          <Zap className="h-3.5 w-3.5 text-[#ffa116]" />
          <span>Developing</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#9ca3af] font-medium">
          <HelpCircle className="h-3.5 w-3.5 text-[#9ca3af]" />
          <span>Unassessed</span>
        </div>
        <div className="w-[1px] h-3.5 bg-[#383838] mx-1" />
        <div className="flex items-center gap-1 text-[#9ca3af] text-[10px]">
          <ArrowRight className="h-3 w-3 text-[#ffa116]" /> Prerequisite direction
        </div>
      </div>

      {/* SVG Canvas Workspace */}
      <svg
        className="w-full h-full pointer-events-auto"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Arrowhead markers */}
          <marker
            id="arrow-satisfied"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-in-progress"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-unmet"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
          </marker>
          <marker
            id="arrow-highlighted"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4f46e5" />
          </marker>

          {/* Glow filter for highlighted paths and nodes */}
          <filter id="glow-highlight" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Drop shadows */}
          <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" floodColor="#0f172a" />
          </filter>
        </defs>

        {/* Domain Column Headers & Background Guidelines */}
        <g className="domain-guidelines pointer-events-none">
          {DOMAIN_HEADERS.map((dh) => (
            <g key={dh.key}>
              {/* Vertical guideline */}
              <line
                x1={dh.x + NODE_WIDTH / 2}
                y1={30}
                x2={dh.x + NODE_WIDTH / 2}
                y2={1100}
                stroke="#2a2a2a"
                strokeWidth="1.5"
                strokeDasharray="4,8"
              />
              {/* Domain Header Pill */}
              <rect
                x={dh.x - 10}
                y={15}
                width={NODE_WIDTH + 20}
                height={32}
                rx={8}
                fill="#262626"
                stroke="#383838"
                strokeWidth="1"
              />
              <text
                x={dh.x + NODE_WIDTH / 2}
                y={36}
                fill="#d1d5db"
                fontSize="11.5"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                letterSpacing="0.04em"
              >
                {dh.label.toUpperCase()}
              </text>
            </g>
          ))}
        </g>

        {/* Directed Prerequisite Edges */}
        <g className="edges">
          {edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = highlightedEdgeIds.has(edge.id);
            const hasFocus = !!activeFocusSlug;

            // Connection coordinates: from source right/bottom to target left/top
            const sx = sourceNode.position_x + NODE_WIDTH / 2;
            const sy = sourceNode.position_y + NODE_HEIGHT;
            const tx = targetNode.position_x + NODE_WIDTH / 2;
            const ty = targetNode.position_y;

            // Smooth cubic Bézier curve
            const dy = Math.max(40, (ty - sy) / 2);
            const pathData = `M ${sx} ${sy} C ${sx} ${sy + dy}, ${tx} ${ty - dy}, ${tx} ${ty}`;

            // Styling based on edge status and focus
            let strokeColor = '#cbd5e1';
            let strokeDash = '4,4';
            let strokeWidth = 1.8;
            let markerId = 'arrow-unmet';
            let opacity = 0.6;

            if (edge.status === 'satisfied') {
              strokeColor = '#10b981';
              strokeDash = 'none';
              strokeWidth = 2.2;
              markerId = 'arrow-satisfied';
              opacity = 0.9;
            } else if (edge.status === 'in_progress') {
              strokeColor = '#f59e0b';
              strokeDash = '6,4';
              strokeWidth = 2;
              markerId = 'arrow-in-progress';
              opacity = 0.85;
            }

            if (isHighlighted) {
              strokeColor = '#4f46e5';
              strokeWidth = 3.5;
              strokeDash = 'none';
              markerId = 'arrow-highlighted';
              opacity = 1;
            } else if (hasFocus) {
              opacity = 0.15;
            }

            return (
              <path
                key={edge.id}
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId})`}
                opacity={opacity}
                className="transition-all duration-200"
              />
            );
          })}
        </g>

        {/* Skill Graph Nodes */}
        <g className="nodes">
          {nodes.map((node) => {
            const isSelected = selectedSkillSlug === node.slug;
            const isHovered = hoveredSlug === node.slug;
            const isAncestor = ancestorSlugs.has(node.slug);
            const isDescendant = descendantSlugs.has(node.slug);
            const matchesFilter = isNodeMatchingFilter(node);

            // Opacity handling when focus or filter is active
            let opacity = 1;
            if (!matchesFilter) {
              opacity = 0.2;
            } else if (activeFocusSlug) {
              if (isSelected || isHovered || isAncestor || isDescendant) {
                opacity = 1;
              } else {
                opacity = 0.35;
              }
            }

            // Visual themes based on mastery level
            let strokeColor = '#383838';
            let fillColor = '#262626';
            let badgeBg = '#1e1e1e';
            let badgeText = '#9ca3af';
            let badgeLabel = '? Unassessed';

            switch (node.mastery_level) {
              case 'mastered':
                strokeColor = '#00b8a3';
                fillColor = '#262626';
                badgeBg = '#00b8a320';
                badgeText = '#00b8a3';
                badgeLabel = '★ Mastered';
                break;
              case 'proficient':
                strokeColor = '#38bdf8';
                fillColor = '#262626';
                badgeBg = '#0284c725';
                badgeText = '#38bdf8';
                badgeLabel = '✓ Proficient';
                break;
              case 'developing':
                strokeColor = '#ffa116';
                fillColor = '#262626';
                badgeBg = '#ffa11620';
                badgeText = '#ffa116';
                badgeLabel = '⚡ Developing';
                break;
              default:
                strokeColor = '#383838';
                fillColor = '#262626';
                badgeBg = '#1e1e1e';
                badgeText = '#9ca3af';
                badgeLabel = '? Unassessed';
                break;
            }

            // Relationship ring highlight
            let haloColor: string | null = null;
            if (isSelected) {
              haloColor = '#ffa116';
            } else if (isHovered) {
              haloColor = '#ffa116aa';
            } else if (isAncestor) {
              haloColor = '#00b8a3'; // Emerald halo for satisfied prerequisite
            } else if (isDescendant) {
              haloColor = '#38bdf8'; // Sky halo for unlocked dependent
            }

            const profVal =
              node.proficiency !== null && node.proficiency !== undefined
                ? node.proficiency <= 1.0 && node.proficiency > 0
                  ? node.proficiency * 100
                  : node.proficiency
                : null;
            const profDisplay = profVal !== null ? `${Math.round(profVal)}%` : '--%';

            return (
              <g
                key={node.slug}
                transform={`translate(${node.position_x}, ${node.position_y})`}
                opacity={opacity}
                cursor="pointer"
                className="transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSkill(node.slug);
                }}
                onMouseEnter={() => setHoveredSlug(node.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
              >
                {/* Optional Halo glow for selection or relationship */}
                {haloColor && (
                  <rect
                    x={-4}
                    y={-4}
                    width={NODE_WIDTH + 8}
                    height={NODE_HEIGHT + 8}
                    rx={14}
                    fill="none"
                    stroke={haloColor}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    opacity={0.9}
                    filter="url(#glow-highlight)"
                  />
                )}

                {/* Node Card Background */}
                <rect
                  x={0}
                  y={0}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={12}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={node.mastery_level === 'unassessed' ? 1.5 : 2}
                  strokeDasharray={node.mastery_level === 'unassessed' ? '4,4' : 'none'}
                  filter="url(#card-shadow)"
                />

                {/* Top Bar: Mastery Badge & Lock Indicator */}
                <g transform="translate(10, 10)">
                  {/* Mastery Badge Background */}
                  <rect
                    x={0}
                    y={0}
                    width={105}
                    height={18}
                    rx={4}
                    fill={badgeBg}
                    stroke={strokeColor}
                    strokeWidth="0.8"
                  />
                  <text
                    x={6}
                    y={13}
                    fill={badgeText}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="system-ui, sans-serif"
                  >
                    {badgeLabel}
                  </text>

                  {/* Lock Indicator if not unlocked */}
                  {!node.is_unlocked && (
                    <g transform="translate(112, 0)">
                      <rect
                        x={0}
                        y={0}
                        width={65}
                        height={18}
                        rx={4}
                        fill="#ff375f20"
                        stroke="#ff375f50"
                        strokeWidth="0.8"
                      />
                      <text
                        x={6}
                        y={13}
                        fill="#ff375f"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                      >
                        🔒 Locked
                      </text>
                    </g>
                  )}
                </g>

                {/* Skill Title */}
                <text
                  x={12}
                  y={46}
                  fill="#ffffff"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                  className="select-none"
                >
                  {node.name.length > 22 ? `${node.name.slice(0, 20)}…` : node.name}
                </text>

                {/* Bottom Row: Proficiency %, Observation Count & Tier */}
                <g transform="translate(12, 60)">
                  <text
                    x={0}
                    y={14}
                    fill={node.proficiency ? '#ffa116' : '#9ca3af'}
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {profDisplay}
                  </text>
                  <text
                    x={45}
                    y={14}
                    fill="#9ca3af"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="system-ui, sans-serif"
                  >
                    · {node.evidence_count} obs
                  </text>
                  <text
                    x={NODE_WIDTH - 24}
                    y={14}
                    fill="#6b7280"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    T{node.tier}
                  </text>
                </g>

                {/* Contextual relationship tag banner */}
                {isAncestor && (
                  <g transform={`translate(${NODE_WIDTH - 76}, -9)`}>
                    <rect x={0} y={0} width={72} height={16} rx={4} fill="#00b8a320" stroke="#00b8a3" strokeWidth="0.8" />
                    <text x={36} y={11} fill="#00b8a3" fontSize="8.5" fontWeight="700" textAnchor="middle">
                      PREREQUISITE
                    </text>
                  </g>
                )}
                {isDescendant && (
                  <g transform={`translate(${NODE_WIDTH - 64}, -9)`}>
                    <rect x={0} y={0} width={60} height={16} rx={4} fill="#ffa11620" stroke="#ffa116" strokeWidth="0.8" />
                    <text x={30} y={11} fill="#ffa116" fontSize="8.5" fontWeight="700" textAnchor="middle">
                      UNLOCKED
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
