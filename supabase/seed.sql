begin;

do $$
declare
  v_owner_id uuid;
  v_company_id uuid;
begin
  select
    companies.owner_id,
    companies.id
  into
    v_owner_id,
    v_company_id
  from public.companies
  order by companies.created_at asc
  limit 1;

  if v_owner_id is null or v_company_id is null then
    raise exception
      'Create and save a company profile before applying demo seed data.';
  end if;

  update public.companies
  set
    name = 'Northline Digital',
    description = 'Northline Digital is a product design and web development studio helping growing companies launch clear, high-converting digital experiences.',
    website = 'https://northline.digital',
    currency = 'USD',
    accent_color = '#0F766E'
  where id = v_company_id;

  insert into public.clients (
    id,
    owner_id,
    company_id,
    company_name,
    contact_name,
    email,
    notes
  )
  values
    (
      '10000000-0000-4000-8000-000000000001',
      v_owner_id,
      v_company_id,
      'BrightSmile Dental',
      'Dr. Elena Marin',
      'elena@brightsmile.example',
      'Multi-location dental clinic preparing a complete website redesign focused on appointment conversion.'
    ),
    (
      '10000000-0000-4000-8000-000000000002',
      v_owner_id,
      v_company_id,
      'AtlasMetrics',
      'Daniel Cooper',
      'daniel@atlasmetrics.example',
      'Early-stage B2B analytics SaaS. Needs a clearer product story and a scalable dashboard design system.'
    ),
    (
      '10000000-0000-4000-8000-000000000003',
      v_owner_id,
      v_company_id,
      'Forma Atelier',
      'Sofia Rossi',
      'sofia@formaatelier.example',
      'Architecture studio looking for a restrained portfolio website with strong project presentation.'
    ),
    (
      '10000000-0000-4000-8000-000000000004',
      v_owner_id,
      v_company_id,
      'Juniper Goods',
      'Maya Thompson',
      'maya@junipergoods.example',
      'Independent homeware brand preparing a conversion-focused seasonal campaign and landing page.'
    ),
    (
      '10000000-0000-4000-8000-000000000005',
      v_owner_id,
      v_company_id,
      'Meridian Advisory',
      'Victor Ionescu',
      'victor@meridianadvisory.example',
      'Management consultancy modernising its positioning, visual system and corporate website.'
    )
  on conflict (id) do update
  set
    owner_id = excluded.owner_id,
    company_id = excluded.company_id,
    company_name = excluded.company_name,
    contact_name = excluded.contact_name,
    email = excluded.email,
    notes = excluded.notes;

  insert into public.services (
    id,
    owner_id,
    company_id,
    name,
    description,
    price,
    unit,
    category
  )
  values
    (
      '20000000-0000-4000-8000-000000000001',
      v_owner_id,
      v_company_id,
      'UX/UI Design',
      'User flows, wireframes and polished responsive interface design for a focused digital product or website.',
      3200.00,
      'project',
      'Design'
    ),
    (
      '20000000-0000-4000-8000-000000000002',
      v_owner_id,
      v_company_id,
      'Landing Page Development',
      'Responsive implementation of a conversion-focused landing page with production-ready frontend code.',
      4200.00,
      'project',
      'Development'
    ),
    (
      '20000000-0000-4000-8000-000000000003',
      v_owner_id,
      v_company_id,
      'Corporate Website Development',
      'Design and development of a responsive multi-page business website with a reusable content structure.',
      7800.00,
      'project',
      'Development'
    ),
    (
      '20000000-0000-4000-8000-000000000004',
      v_owner_id,
      v_company_id,
      'SaaS Dashboard Design',
      'Product discovery, information architecture and interface design for a desktop-first SaaS dashboard.',
      5200.00,
      'project',
      'Product Design'
    ),
    (
      '20000000-0000-4000-8000-000000000005',
      v_owner_id,
      v_company_id,
      'Frontend Development',
      'TypeScript and React frontend development for approved product screens, components and interactions.',
      95.00,
      'hour',
      'Development'
    ),
    (
      '20000000-0000-4000-8000-000000000006',
      v_owner_id,
      v_company_id,
      'Design System',
      'Reusable foundations, tokens and documented components for consistent product development.',
      3800.00,
      'project',
      'Product Design'
    ),
    (
      '20000000-0000-4000-8000-000000000007',
      v_owner_id,
      v_company_id,
      'Website Audit',
      'Structured UX, conversion, accessibility and frontend quality review with prioritised recommendations.',
      900.00,
      'project',
      'Strategy'
    ),
    (
      '20000000-0000-4000-8000-000000000008',
      v_owner_id,
      v_company_id,
      'Monthly Support',
      'Reserved monthly capacity for design improvements, frontend updates and launch support.',
      1600.00,
      'month',
      'Support'
    )
  on conflict (id) do update
  set
    owner_id = excluded.owner_id,
    company_id = excluded.company_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    unit = excluded.unit,
    category = excluded.category;
      insert into public.proposals (
    id,
    owner_id,
    company_id,
    client_id,
    proposal_number,
    project_title,
    brief,
    status,
    currency,
    discount_type,
    discount_value,
    subtotal,
    total,
    valid_until,
    public_token,
    published_at,
    last_viewed_at,
    accepted_at,
    rejected_at,
    created_at,
    updated_at
  )
  values
    (
      '30000000-0000-4000-8000-000000000001',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000001',
      'PF-2026-001',
      'BrightSmile Dental Website Redesign',
      'Redesign and develop a modern multi-location dental website focused on service discovery, doctor trust and appointment conversion.',
      'draft',
      'USD',
      'none',
      0,
      11900,
      11900,
      '2026-08-20',
      null,
      null,
      null,
      null,
      null,
      '2026-07-30 09:00:00+00',
      '2026-07-30 09:00:00+00'
    ),
    (
      '30000000-0000-4000-8000-000000000002',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000002',
      'PF-2026-002',
      'AtlasMetrics SaaS Dashboard MVP',
      'Create a clearer analytics dashboard, reusable product components and a production-ready frontend foundation for the next customer pilot.',
      'sent',
      'USD',
      'percentage',
      5,
      10900,
      10355,
      '2026-08-15',
      'pf_demo_atlas_dashboard_2026_a1b2c3d4',
      '2026-07-29 11:00:00+00',
      null,
      null,
      null,
      '2026-07-27 10:00:00+00',
      '2026-07-29 11:00:00+00'
    ),
    (
      '30000000-0000-4000-8000-000000000003',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000003',
      'PF-2026-003',
      'Forma Atelier Portfolio Website',
      'Design and develop a restrained architectural portfolio that gives individual projects more space and makes the studio easier to evaluate.',
      'sent',
      'USD',
      'none',
      0,
      8700,
      8700,
      '2026-08-18',
      'pf_demo_forma_portfolio_2026_e5f6g7h8',
      '2026-07-30 14:30:00+00',
      null,
      null,
      null,
      '2026-07-28 13:00:00+00',
      '2026-07-30 14:30:00+00'
    ),
    (
      '30000000-0000-4000-8000-000000000004',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000004',
      'PF-2026-004',
      'Juniper Goods Autumn Campaign',
      'Create a focused seasonal landing page that presents the autumn collection, communicates product value and guides customers toward purchase.',
      'viewed',
      'USD',
      'fixed',
      300,
      5100,
      4800,
      '2026-08-10',
      'pf_demo_juniper_campaign_2026_i9j0k1l2',
      '2026-07-26 08:30:00+00',
      '2026-08-01 08:42:00+00',
      null,
      null,
      '2026-07-24 15:00:00+00',
      '2026-08-01 08:42:00+00'
    ),
    (
      '30000000-0000-4000-8000-000000000005',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000005',
      'PF-2026-005',
      'Meridian Advisory Digital Repositioning',
      'Modernise the consultancy brand experience through a clearer information architecture, stronger visual system and responsive corporate website.',
      'accepted',
      'USD',
      'percentage',
      10,
      14800,
      13320,
      '2026-08-05',
      'pf_demo_meridian_website_2026_m3n4o5p6',
      '2026-07-18 10:00:00+00',
      '2026-07-22 16:18:00+00',
      '2026-07-22 16:25:00+00',
      null,
      '2026-07-15 09:00:00+00',
      '2026-07-22 16:25:00+00'
    ),
    (
      '30000000-0000-4000-8000-000000000006',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000002',
      'PF-2026-006',
      'AtlasMetrics Product Design System',
      'Build a reusable design system for the existing dashboard so the product team can ship new analytics features faster and more consistently.',
      'accepted',
      'USD',
      'none',
      0,
      9000,
      9000,
      '2026-07-30',
      'pf_demo_atlas_system_2026_q7r8s9t0',
      '2026-07-10 12:00:00+00',
      '2026-07-12 09:45:00+00',
      '2026-07-12 10:10:00+00',
      null,
      '2026-07-08 11:00:00+00',
      '2026-07-12 10:10:00+00'
    ),
    (
      '30000000-0000-4000-8000-000000000007',
      v_owner_id,
      v_company_id,
      '10000000-0000-4000-8000-000000000001',
      'PF-2026-007',
      'BrightSmile Website Support Retainer',
      'Provide reserved monthly design and frontend support after launch, including content updates, campaign pages and conversion improvements.',
      'rejected',
      'USD',
      'none',
      0,
      4800,
      4800,
      '2026-07-25',
      'pf_demo_brightsmile_support_2026_u1v2w3x4',
      '2026-07-05 09:30:00+00',
      '2026-07-07 14:00:00+00',
      null,
      '2026-07-07 14:12:00+00',
      '2026-07-03 13:00:00+00',
      '2026-07-07 14:12:00+00'
    )
  on conflict (id) do update
  set
    owner_id = excluded.owner_id,
    company_id = excluded.company_id,
    client_id = excluded.client_id,
    proposal_number = excluded.proposal_number,
    project_title = excluded.project_title,
    brief = excluded.brief,
    status = excluded.status,
    currency = excluded.currency,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    subtotal = excluded.subtotal,
    total = excluded.total,
    valid_until = excluded.valid_until,
    public_token = excluded.public_token,
    published_at = excluded.published_at,
    last_viewed_at = excluded.last_viewed_at,
    accepted_at = excluded.accepted_at,
    rejected_at = excluded.rejected_at,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at;

  insert into public.proposal_items (
    id,
    proposal_id,
    service_id,
    name,
    description,
    quantity,
    unit,
    unit_price,
    position
  )
  values
    (
      '50000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000007',
      'Website Audit',
      'Review the current website structure, content and conversion journey.',
      1,
      'project',
      900,
      0
    ),
    (
      '50000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      'UX/UI Design',
      'Responsive design for the main website, services, doctors and appointment journey.',
      1,
      'project',
      3200,
      1
    ),
    (
      '50000000-0000-4000-8000-000000000003',
      '30000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000003',
      'Corporate Website Development',
      'Production-ready responsive website implementation.',
      1,
      'project',
      7800,
      2
    ),
    (
      '50000000-0000-4000-8000-000000000004',
      '30000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000004',
      'SaaS Dashboard Design',
      'Dashboard information architecture and core product screens.',
      1,
      'project',
      5200,
      0
    ),
    (
      '50000000-0000-4000-8000-000000000005',
      '30000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000006',
      'Design System',
      'Reusable tokens and components for the dashboard.',
      1,
      'project',
      3800,
      1
    ),
    (
      '50000000-0000-4000-8000-000000000006',
      '30000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000005',
      'Frontend Development',
      'Implementation support for the approved pilot screens.',
      20,
      'hour',
      95,
      2
    ),
    (
      '50000000-0000-4000-8000-000000000007',
      '30000000-0000-4000-8000-000000000003',
      '20000000-0000-4000-8000-000000000007',
      'Website Audit',
      'Review the existing portfolio structure and project content.',
      1,
      'project',
      900,
      0
    ),
    (
      '50000000-0000-4000-8000-000000000008',
      '30000000-0000-4000-8000-000000000003',
      '20000000-0000-4000-8000-000000000003',
      'Corporate Website Development',
      'Design and implementation of the architectural portfolio website.',
      1,
      'project',
      7800,
      1
    ),
    (
      '50000000-0000-4000-8000-000000000009',
      '30000000-0000-4000-8000-000000000004',
      '20000000-0000-4000-8000-000000000007',
      'Website Audit',
      'Campaign funnel and product presentation review.',
      1,
      'project',
      900,
      0
    ),
    (
      '50000000-0000-4000-8000-000000000010',
      '30000000-0000-4000-8000-000000000004',
      '20000000-0000-4000-8000-000000000002',
      'Landing Page Development',
      'Responsive seasonal landing page design and implementation.',
      1,
      'project',
      4200,
      1
    ),
    (
      '50000000-0000-4000-8000-000000000011',
      '30000000-0000-4000-8000-000000000005',
      '20000000-0000-4000-8000-000000000001',
      'UX/UI Design',
      'Website structure and responsive interface design.',
      1,
      'project',
      3200,
      0
    ),
    (
      '50000000-0000-4000-8000-000000000012',
      '30000000-0000-4000-8000-000000000005',
      '20000000-0000-4000-8000-000000000006',
      'Design System',
      'Reusable brand and interface foundations.',
      1,
      'project',
      3800,
      1
    ),
    (
      '50000000-0000-4000-8000-000000000013',
      '30000000-0000-4000-8000-000000000005',
      '20000000-0000-4000-8000-000000000003',
      'Corporate Website Development',
      'Responsive corporate website development and launch.',
      1,
      'project',
      7800,
      2
    ),
    (
      '50000000-0000-4000-8000-000000000014',
      '30000000-0000-4000-8000-000000000006',
      '20000000-0000-4000-8000-000000000004',
      'SaaS Dashboard Design',
      'Core product patterns and dashboard layouts.',
      1,
      'project',
      5200,
      0
    ),
    (
      '50000000-0000-4000-8000-000000000015',
      '30000000-0000-4000-8000-000000000006',
      '20000000-0000-4000-8000-000000000006',
      'Design System',
      'Documented components, tokens and usage rules.',
      1,
      'project',
      3800,
      1
    ),
    (
      '50000000-0000-4000-8000-000000000016',
      '30000000-0000-4000-8000-000000000007',
      '20000000-0000-4000-8000-000000000008',
      'Monthly Support',
      'Three months of reserved post-launch support.',
      3,
      'month',
      1600,
      0
    )
  on conflict (id) do update
  set
    proposal_id = excluded.proposal_id,
    service_id = excluded.service_id,
    name = excluded.name,
    description = excluded.description,
    quantity = excluded.quantity,
    unit = excluded.unit,
    unit_price = excluded.unit_price,
    position = excluded.position;

  insert into public.proposal_sections (
    id,
    proposal_id,
    section_type,
    title,
    content,
    position,
    is_ai_generated
  )
  values
    (
      '40000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001',
      'task_understanding',
      'Understanding the project',
      'BrightSmile needs a modern website that makes complex dental services easy to understand and gives new patients confidence before booking.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000001',
      'proposed_solution',
      'Proposed solution',
      'We will create a clear service architecture, stronger doctor profiles and a focused appointment journey across desktop and mobile.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000003',
      '30000000-0000-4000-8000-000000000001',
      'work_stages',
      'Project stages',
      'Audit and discovery, information architecture, interface design, responsive development, quality assurance and launch preparation.',
      2,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000004',
      '30000000-0000-4000-8000-000000000001',
      'expected_result',
      'Expected result',
      'A trustworthy, fast and conversion-focused website that supports advertising campaigns and improves appointment enquiries.',
      3,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000005',
      '30000000-0000-4000-8000-000000000002',
      'task_understanding',
      'Understanding the product',
      'AtlasMetrics needs a dashboard that helps users interpret performance quickly without making the interface feel technically overwhelming.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000006',
      '30000000-0000-4000-8000-000000000002',
      'proposed_solution',
      'Proposed solution',
      'We will simplify the information hierarchy, define reusable product patterns and implement the highest-priority pilot screens.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000007',
      '30000000-0000-4000-8000-000000000002',
      'work_stages',
      'Delivery stages',
      'Product workshop, user-flow review, dashboard design, component system and frontend implementation support.',
      2,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000008',
      '30000000-0000-4000-8000-000000000002',
      'next_steps',
      'Next steps',
      'Approve the scope, provide access to the current product and schedule the initial product workshop.',
      3,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000009',
      '30000000-0000-4000-8000-000000000003',
      'task_understanding',
      'Understanding the project',
      'Forma Atelier needs a digital portfolio that reflects the calm precision of its architectural work and gives every project a strong visual narrative.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000010',
      '30000000-0000-4000-8000-000000000003',
      'proposed_solution',
      'Proposed solution',
      'We will design a minimal portfolio system with flexible project pages, strong typography and responsive image presentation.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000011',
      '30000000-0000-4000-8000-000000000003',
      'expected_result',
      'Expected result',
      'A refined portfolio that makes the studio easier to evaluate and supports conversations with prospective clients and partners.',
      2,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000012',
      '30000000-0000-4000-8000-000000000004',
      'task_understanding',
      'Campaign objective',
      'Juniper Goods needs a focused seasonal page that introduces the autumn collection without losing the warmth and simplicity of the brand.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000013',
      '30000000-0000-4000-8000-000000000004',
      'proposed_solution',
      'Proposed solution',
      'We will combine strong product storytelling, clear collection navigation and a direct path from campaign content to purchase.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000014',
      '30000000-0000-4000-8000-000000000004',
      'expected_result',
      'Expected result',
      'A fast campaign page designed to support paid traffic, product discovery and seasonal conversion.',
      2,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000015',
      '30000000-0000-4000-8000-000000000005',
      'task_understanding',
      'Understanding the business',
      'Meridian Advisory has strong expertise but its current digital presentation does not clearly communicate positioning, services or credibility.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000016',
      '30000000-0000-4000-8000-000000000005',
      'proposed_solution',
      'Proposed solution',
      'We will create a clearer website structure, a professional visual system and reusable layouts for expertise, services and case studies.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000017',
      '30000000-0000-4000-8000-000000000005',
      'work_stages',
      'Project stages',
      'Stakeholder discovery, positioning review, UX structure, visual design, design system, development and launch.',
      2,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000018',
      '30000000-0000-4000-8000-000000000005',
      'expected_result',
      'Expected result',
      'A credible corporate website that supports business development and communicates Meridian expertise with greater clarity.',
      3,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000019',
      '30000000-0000-4000-8000-000000000006',
      'task_understanding',
      'Product challenge',
      'AtlasMetrics needs consistent reusable interface patterns so new dashboard features can be designed and shipped without visual drift.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000020',
      '30000000-0000-4000-8000-000000000006',
      'proposed_solution',
      'Proposed solution',
      'We will define foundations, reusable components, dashboard patterns and practical documentation for product and engineering teams.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000021',
      '30000000-0000-4000-8000-000000000006',
      'expected_result',
      'Expected result',
      'A scalable design foundation that improves consistency and reduces the time required to deliver future product screens.',
      2,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000022',
      '30000000-0000-4000-8000-000000000007',
      'task_understanding',
      'Support requirement',
      'BrightSmile requested reliable access to design and frontend support after the main website launch.',
      0,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000023',
      '30000000-0000-4000-8000-000000000007',
      'proposed_solution',
      'Proposed support',
      'Northline Digital will reserve monthly capacity for content updates, campaign pages and conversion improvements.',
      1,
      true
    ),
    (
      '40000000-0000-4000-8000-000000000024',
      '30000000-0000-4000-8000-000000000007',
      'next_steps',
      'Next steps',
      'Confirm the monthly priority process, responsible contacts and preferred support start date.',
      2,
      true
    )
  on conflict (id) do update
  set
    proposal_id = excluded.proposal_id,
    section_type = excluded.section_type,
    title = excluded.title,
    content = excluded.content,
    position = excluded.position,
    is_ai_generated = excluded.is_ai_generated;

  insert into public.proposal_views (
    id,
    proposal_id,
    viewed_at,
    visitor_hash,
    user_agent
  )
  values
    (
      '60000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000004',
      '2026-07-31 17:15:00+00',
      'demo-juniper-visitor',
      'ProposalFlow demo browser'
    ),
    (
      '60000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000004',
      '2026-08-01 08:42:00+00',
      'demo-juniper-visitor',
      'ProposalFlow demo browser'
    ),
    (
      '60000000-0000-4000-8000-000000000003',
      '30000000-0000-4000-8000-000000000005',
      '2026-07-22 16:18:00+00',
      'demo-meridian-visitor',
      'ProposalFlow demo browser'
    ),
    (
      '60000000-0000-4000-8000-000000000004',
      '30000000-0000-4000-8000-000000000006',
      '2026-07-12 09:45:00+00',
      'demo-atlas-visitor',
      'ProposalFlow demo browser'
    ),
    (
      '60000000-0000-4000-8000-000000000005',
      '30000000-0000-4000-8000-000000000007',
      '2026-07-07 14:00:00+00',
      'demo-brightsmile-visitor',
      'ProposalFlow demo browser'
    )
  on conflict (id) do update
  set
    proposal_id = excluded.proposal_id,
    viewed_at = excluded.viewed_at,
    visitor_hash = excluded.visitor_hash,
    user_agent = excluded.user_agent;

  insert into public.proposal_responses (
    id,
    proposal_id,
    response,
    responded_at,
    client_name,
    client_email
  )
  values
    (
      '70000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000005',
      'accepted',
      '2026-07-22 16:25:00+00',
      'Victor Ionescu',
      'victor@meridianadvisory.example'
    ),
    (
      '70000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000006',
      'accepted',
      '2026-07-12 10:10:00+00',
      'Daniel Cooper',
      'daniel@atlasmetrics.example'
    ),
    (
      '70000000-0000-4000-8000-000000000003',
      '30000000-0000-4000-8000-000000000007',
      'rejected',
      '2026-07-07 14:12:00+00',
      'Dr. Elena Marin',
      'elena@brightsmile.example'
    )
  on conflict (proposal_id) do update
  set
    response = excluded.response,
    responded_at = excluded.responded_at,
    client_name = excluded.client_name,
    client_email = excluded.client_email;
end;
$$;

commit;